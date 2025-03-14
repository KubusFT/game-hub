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
const axios = require('axios');

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins; in production, you can limit it to specific origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.get('/api/games', async (req, res) => {
    try {
        const response = await axios.get(
            `https://api.steampowered.com/ISteamApps/GetAppList/v2?key=${process.env.REACT_APP_STEAM_API_KEY}`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/game-details/:appid', async (req, res) => {
    const { appid } = req.params;
    try {
        const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appid}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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