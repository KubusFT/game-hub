const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const request = require('supertest');
const app = express();
const util = require('util');
const PORT = process.env.PORT || 4000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

require('dotenv').config();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((err) => {
	if (err) {
	  console.error('Error connecting to the database: ', err);
	  return;
	}
	console.log('Connected to the database');
  });

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});
