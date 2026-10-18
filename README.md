# BMI Calculator

This application can calculate any person's BMI using their Weight (in kg) and Height (in cm). In addition to this the application can also provide an information regarding the BMI Category and Health risk based on the calculated BMI.

This application can be used as a standalone data processor from the Database or can be exposed externally as an API.

## BMI Ranges (kg/m<sup>2</sup>)

-   18.4 and below
-   18.5 - 24.9
-   25 - 29.9
-   30 - 34.9
-   35 - 39.9
-   40 and above

## BMI Category and Health Risk

| BMI Range      | BMI Category        | Health Risk       |
| -------------- | ------------------- | ----------------- |
| 18.4 and below | Underweight         | Malnutrition risk |
| 18.5 - 24.9    | Normal weight       | Low risk          |
| 25 - 29.9      | Overweight          | Enhanced risk     |
| 30 - 34.9      | Moderately Obese    | Medium risk       |
| 35 - 39.9      | Severely Obese      | High risk         |
| 40 and above   | Very Severely Obese | Very High risk    |

---

## Requirements

To run this application on your location system, the following installations are needed:

1. Node.js 18 or newer (CI tests Node.js 22 and 24)
2. NPM Module
3. MongoDB

## How to use

Run `npm test` for BMI calculation and HTTP route tests. The tests do not require
a running MongoDB instance.

-   Clone the repository
-   Add your MongoDB localhost path in **.env.example** and rename it to **.env**
-   Run `npm run setup-app`

    -   This is will do a clean installation of all the node modules and setup your MongoDB database with sample documents which can be used to calculate BMI.

-   Either run `npm run dev` to start the server in Development mode
-   Or run `npm run start` to start the server in Production mode

---

## API Endpoints

URL: http://(localhost):(port)

### GET Method

> {URL}/patients

**Description:** This request will fetch all the records from the Database

**Authorization:** Basic Auth (Username & Password)

### POST Method

> {URL}/patients

**Description:** This request will calculate the BMI, BMI Category and Health Risk in the Database for documents where BMI is null

**Authorization:** Basic Auth (Username & Password)

**Request Sample**

<pre>
{}
</pre>

**Response Sample**

<pre>
{
    "status": 200,
    "message": "6 Documents Modified"
}
</pre>

> {URL}/calculate

**Description:** This request will calculate the BMI, BMI Category and Health Risk

**Authorization:** Basic Auth (Username & Password)

**Request Sample**

<pre>
{
    "Gender": "Male",
    "HeightCm": 135,
    "WeightKg": 97
}
</pre>

**Response Sample**

<pre>
{
    "HeightCm": 135,
    "WeightKg": 97,
    "BMI": 53.22,
    "Health Risk": "Very High risk",
    "BMI Category": "Very severely Obese"
}
</pre>

> {URL}/insert

**Description:** This request will calculate the BMI, BMI Category and Health Risk for the request data and insert into the database

**Authorization:** Basic Auth (Username & Password)

**Request Sample**

<pre>
{
    "Gender": "Male",
    "HeightCm": 135,
    "WeightKg": 97
}
</pre>

**Response Sample**

<pre>
{
    "HeightCm": 135,
    "WeightKg": 97,
    "BMI": 53.22,
    "Health Risk": "Very High risk",
    "BMI Category": "Very severely Obese"
}
</pre>
