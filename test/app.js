const assert = require('assert');
const { readFileSync } = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');
const express = require('express');

describe('HTTP routes', () => {
    let server;

    before(async () => {
        const app = express();
        app.listen = () => {};
        const dependencies = {
            path,
            mongodb: { MongoClient: class {} },
            express: Object.assign(() => app, express),
            os: { platform: () => 'linux' },
            './setup': {},
            './calculate': require('../src/calculate'),
            '../model/patient': {},
        };
        vm.runInNewContext(
            readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8'),
            {
                process: { env: {} },
                require(name) {
                    assert.ok(Object.prototype.hasOwnProperty.call(dependencies, name));
                    return dependencies[name];
                },
            },
            { filename: 'app.js' },
        );
        server = http.createServer(app);
        await new Promise((resolve, reject) => {
            server.once('error', reject);
            server.listen(0, '127.0.0.1', resolve);
        });
    });

    after(() => new Promise((resolve, reject) => {
        if (!server || !server.listening) return resolve();
        server.close((error) => error ? reject(error) : resolve());
    }));

    function request(method, route, body) {
        return new Promise((resolve, reject) => {
            const req = http.request({
                host: '127.0.0.1', port: server.address().port, path: route, method,
                headers: body ? { 'Content-Type': 'application/json' } : {},
            }, (res) => {
                let data = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, body: JSON.parse(data) });
                    } catch (error) {
                        reject(error);
                    }
                });
                res.on('error', reject);
            });
            req.on('error', reject);
            req.end(body && JSON.stringify(body));
        });
    }

    it('calculates BMI through the HTTP endpoint', async () => {
        assert.deepStrictEqual(await request('POST', '/calculate', {
            HeightCm: 175, WeightKg: 75,
        }), {
            status: 200,
            body: {
                HeightCm: 175, WeightKg: 75, BMI: 24.49,
                'Health Risk': 'Low risk', 'BMI Category': 'Normal weight',
            },
        });
    });

    it('preserves the response to an unparsed request body', async () => {
        assert.deepStrictEqual(await request('POST', '/calculate'), {
            status: 200,
            body: { BMI: null, 'Health Risk': null, 'BMI Category': null },
        });
    });

    for (const method of ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']) {
        for (const route of ['/', '/missing/nested']) {
            it(`preserves the ${method} ${route} fallback`, async () => {
                const notFound = method === 'GET' || method === 'POST';
                const status = notFound ? 404 : 405;
                assert.deepStrictEqual(await request(method, route), {
                    status,
                    body: {
                        status,
                        message: notFound ? 'Resource Not Found' : 'Method not allowed!',
                    },
                });
            });
        }
    }
});
