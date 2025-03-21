const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const util = require('util');
const PORT = process.env.PORT || 4000;
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

const getIGDBAccessToken = async () => {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.IGDB_CLIENT_ID,
                client_secret: process.env.IGDB_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching IGDB access token:', error.message);
        throw error;
    }
};

const fetchGamesFromIGDB = async (accessToken, offset = 0, limit = 50) => {
    try {
        const response = await axios.post('https://api.igdb.com/v4/games', 
            `fields id, name, cover.url, first_release_date; limit ${limit}; offset ${offset};`, 
            {
                headers: {
                    'Client-ID': process.env.IGDB_CLIENT_ID,
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching games from IGDB:', error.message);
        throw error;
    }
};

app.get('/api/games', async (req, res) => {
    try {
        // Check if the data is in the cache
        const cachedGames = gameCache.get('games');
        if (cachedGames) {
            return res.json(cachedGames);
        }

        // Fetch games from the database
        const games = await query('SELECT * FROM games');
        if (games.length > 0) {
            // Cache the data
            gameCache.set('games', games);
            return res.json(games);
        }

        // Fetch the IGDB access token
        const accessToken = await getIGDBAccessToken();

        let offset = 0;
        const limit = 50;
        let allGames = [];

        while (true) {
            const gameList = await fetchGamesFromIGDB(accessToken, offset, limit);
            if (gameList.length === 0) break;

            allGames = allGames.concat(gameList);
            offset += limit;
        }

        const gameDetails = [];
        for (const game of allGames) {
            const { id, name, first_release_date, cover } = game;
            const coverUrl = cover ? cover.url : null;

            await query('INSERT INTO games (id, name, release_date, cover, type) VALUES (?, ?, ?, ?, ?)', [
                id,
                name,
                first_release_date,
                coverUrl,
                'game'
            ]);

            gameDetails.push({
                id,
                name,
                release_date: first_release_date,
                cover: coverUrl,
                type: 'game'
            });
        }

        // Cache the data
        gameCache.set('games', gameDetails);
        res.json(gameDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/games/:id/vote', async (req, res) => {
    const gameId = req.params.id;
    try {
        await query('UPDATE games SET votes = votes + 1 WHERE id = ?', [gameId]);
        res.status(200).json({ message: 'Vote counted' });
    } catch (error) {
        console.error('Error voting for game:', error.message);
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