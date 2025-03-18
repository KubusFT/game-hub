const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const util = require('util');
const PORT = process.env.PORT || 4000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const NodeCache = require('node-cache');
const gameCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

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

const query = util.promisify(connection.query).bind(connection);

app.get('/api/games', async (req, res) => {
    try {
        // Check if the data is in the cache
        const cachedGames = gameCache.get('games');
        if (cachedGames) {
            return res.json(cachedGames);
        }

        // Load the game list from the JSON file
        const gameList = require('./assets/anything.json').applist.apps;

        const gameDetails = [];
        let index = 0;

        const interval = setInterval(async () => {
            if (index >= gameList.length) {
                clearInterval(interval);
                // Cache the data
                gameCache.set('games', gameDetails);
                return res.json(gameDetails);
            }

            const game = gameList[index];
            index++;

            if (!game.appid) {
                return;
            }

            try {
                const gameDetailResponse = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${game.appid}`);
                const gameDetailData = gameDetailResponse.data[game.appid]?.data;

                if (gameDetailData && gameDetailData.type === 'game') {
                    const { name, release_date, header_image, type } = gameDetailData;
                    const releaseDate = release_date?.date || null;
                    const cover = header_image || null;

                    await query('INSERT INTO games (id, name, release_date, cover, type) VALUES (?, ?, ?, ?, ?)', [
                        game.appid,
                        name,
                        releaseDate,
                        cover,
                        type
                    ]);

                    gameDetails.push({
                        id: game.appid,
                        name,
                        release_date: releaseDate,
                        cover,
                        type
                    });

                    // Log progress
                    console.log(`Saved game ${index} of ${gameList.length}`);
                }
            } catch (error) {
                console.error(`Error fetching details for appid ${game.appid}: ${error.message}`);
            }
        }, 100);
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