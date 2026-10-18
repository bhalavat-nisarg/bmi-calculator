const path = require('path');
const { MongoClient } = require('mongodb');
const express = require('express');
const os = require('os');
const setupDB = require('./setup');
const bmiFn = require('./calculate');
const patient = require('../model/patient');

if (os.platform() === 'win32') {
    const dotenv = require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
    if (req.body === undefined) req.body = {};
    next();
});

const client = new MongoClient(setupDB.url);

app.get('/patients', async (req, res) => {
    const auth_usr = process.env.API_USER;
    const auth_pwd = process.env.API_PASS;

    if (!req.headers.authorization) {
        res.status(401).send({
            status: 401,
            message: 'Authentication failed. Please provide a Token!',
        });
    } else {
        let encoded = req.headers.authorization.replace('Basic ', '');
        let auth = decodeBase64(encoded);
        if (auth.user !== auth_usr || auth.pass !== auth_pwd) {
            res.status(401).send({
                status: 401,
                message: 'Authentication failed. Invalid Token!',
            });
        } else {
            const db = await connectDB();
            const result = await db.find().toArray();
            await client.close();

            res.status(200).send({
                'Total Count': result.length,
                items: result,
            });
        }
    }
});

app.post('/calculate', async (req, res) => {
    let ret = bmiFn(req.body.HeightCm, req.body.WeightKg);
    res.status(200).send({
        HeightCm: req.body.HeightCm,
        WeightKg: req.body.WeightKg,
        BMI: ret.bmi,
        'Health Risk': ret.risk,
        'BMI Category': ret.bmiCat,
    });
});

app.post('/insert', async (req, res) => {
    const auth_usr = process.env.API_USER;
    const auth_pwd = process.env.API_PASS;

    if (!req.headers.authorization) {
        res.status(401).send({
            status: 401,
            message: 'Authentication failed. Please provide a Token!',
        });
    } else {
        let encoded = req.headers.authorization.replace('Basic ', '');
        let auth = decodeBase64(encoded);
        if (auth.user !== auth_usr || auth.pass !== auth_pwd) {
            res.status(401).send({
                status: 401,
                message: 'Authentication failed. Invalid Token!',
            });
        } else {
            const db = await connectDB();
            let ret = bmiFn(req.body.HeightCm, req.body.WeightKg);
            db.insertOne(
                {
                    Gender: req.body.Gender,
                    HeightCm: req.body.HeightCm,
                    WeightKg: req.body.WeightKg,
                    BMI: ret.bmi,
                    'Health Risk': ret.risk,
                    'BMI Category': ret.bmiCat,
                },
                () => {
                    res.status(200).send({
                        HeightCm: req.body.HeightCm,
                        WeightKg: req.body.WeightKg,
                        BMI: ret.bmi,
                        'Health Risk': ret.risk,
                        'BMI Category': ret.bmiCat,
                    });
                }
            );
            await client.close();
        }
    }
});

app.post('/patients', async (req, res) => {
    const auth_usr = process.env.API_USER;
    const auth_pwd = process.env.API_PASS;

    if (!req.headers.authorization) {
        res.status(401).send({
            status: 401,
            message: 'Authentication failed. Please provide a Token!',
        });
    } else {
        let encoded = req.headers.authorization.replace('Basic ', '');
        let auth = decodeBase64(encoded);
        if (auth.user !== auth_usr || auth.pass !== auth_pwd) {
            res.status(401).send({
                status: 401,
                message: 'Authentication failed. Invalid Token!',
            });
        } else {
            const result = await calculateDB();

            res.status(200).send({
                status: 200,
                message: result + ' Documents Modified',
            });
        }
    }
});

app.get('/{*path}', (req, res) => {
    res.status(404).send({
        status: 404,
        message: 'Resource Not Found',
    });
});

app.post('/{*path}', (req, res) => {
    res.status(404).send({
        status: 404,
        message: 'Resource Not Found',
    });
});

app.patch('/{*path}', (req, res) => {
    res.status(405).send({
        status: 405,
        message: 'Method not allowed!',
    });
});

app.put('/{*path}', (req, res) => {
    res.status(405).send({
        status: 405,
        message: 'Method not allowed!',
    });
});

app.delete('/{*path}', (req, res) => {
    res.status(405).send({
        status: 405,
        message: 'Method not allowed!',
    });
});

app.listen(port, () => {
    console.log('Server running on port: ' + port);
});

async function connectDB() {
    client.connect();
    return client.db().collection(setupDB.dbCol);
}

async function calculateDB() {
    const db = await connectDB();
    let cnt = 0;
    const documents = db.find({ BMI: null });
    cnt = (await db.countDocuments({ BMI: null })).valueOf();

    documents.forEach((elem) => {
        let ret = bmiFn(elem.HeightCm, elem.WeightKg);
        db.updateOne(
            { _id: elem._id },
            {
                $set: {
                    BMI: ret.bmi,
                    BMICategory: ret.bmiCat,
                    HealthRisk: ret.risk,
                },
            }
        );
    });
    return cnt;
}

function decodeBase64(token) {
    let buff = new Buffer.from(token, 'base64');
    let decoded = buff.toString('ascii');
    let arr = decoded.split(':');
    let user = arr[0];
    let pass = arr[1];
    return { user, pass };
}
