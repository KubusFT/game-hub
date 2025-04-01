const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const util = require('util');
const PORT = process.env.PORT || 4000;
const NodeCache = require('node-cache');
const gameCache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour
const bcrypt = require('bcrypt');

require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allows all origins; in production, restrict to specific origins
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

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database: ', err);
        return;
    }
    console.log('Connected to the database');
});

// Endpoint pobierający listę gier
app.get("/api/games", async (req, res) => {
    try {
        const userId = req.query.userId || null; // Pobieramy ID użytkownika z query stringa
        
        // Modyfikujemy zapytanie o listę gier, aby pobierało ocenę użytkownika
        const games = await query(`
            SELECT 
                g.id, 
                g.name, 
                IF(g.rating_count > 0, g.rating_sum/g.rating_count, 0) AS average_rating,
                g.rating_count,
                ${userId ? '(SELECT rating FROM game_votes WHERE user_id = ? AND game_id = g.id) AS user_rating' : 'NULL AS user_rating'}
            FROM games g
            ORDER BY g.name ASC
        `, userId ? [userId] : []);
        
        res.json(games);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint do oddawania głosu – ocena gwiazdkowa
app.post("/api/games/:id/vote", async (req, res) => {
    const gameId = req.params.id;
    const { rating, userId } = req.body; // Wymagamy ID użytkownika, który głosuje
    
    if (!userId) {
        return res.status(401).json({ error: "Musisz być zalogowany, aby ocenić grę" });
    }
    
    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Nieprawidłowa wartość oceny" });
    }
    
    try {
        // Sprawdzamy, czy użytkownik już głosował na tę grę
        const existingVote = await query(
            "SELECT * FROM game_votes WHERE user_id = ? AND game_id = ?",
            [userId, gameId]
        );
        
        let oldRating = 0;
        
        if (existingVote.length > 0) {
            // Użytkownik już głosował - pobieramy starą ocenę
            oldRating = existingVote[0].rating;
            
            // Aktualizujemy jego głos
            await query(
                "UPDATE game_votes SET rating = ? WHERE user_id = ? AND game_id = ?",
                [rating, userId, gameId]
            );
            
            // Aktualizujemy sumę ocen w tabeli games (odejmujemy starą, dodajemy nową)
            await query(
                "UPDATE games SET rating_sum = rating_sum - ? + ? WHERE id = ?",
                [oldRating, rating, gameId]
            );
        } else {
            // Użytkownik głosuje po raz pierwszy
            await query(
                "INSERT INTO game_votes (user_id, game_id, rating) VALUES (?, ?, ?)",
                [userId, gameId, rating]
            );
            
            // Aktualizujemy sumę ocen i licznik w tabeli games
            await query(
                "UPDATE games SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?",
                [rating, gameId]
            );
        }
        
        // Inwalidacja cache, aby przy kolejnym pobraniu listy gier dane były świeże
        gameCache.del("games");
        
        // Zwracamy zaktualizowane dane o grze
        const updatedGame = await query(`
            SELECT 
                id, 
                name, 
                IF(rating_count > 0, rating_sum/rating_count, 0) AS average_rating,
                rating_count,
                (SELECT rating FROM game_votes WHERE user_id = ? AND game_id = ?) AS user_rating
            FROM games 
            WHERE id = ?
        `, [userId, gameId, gameId]);
        
        res.json(updatedGame[0]);
    } catch (error) {
        console.error("Error voting for game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post('/api/users/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    try {
        // Szyfrujemy hasło. Domyślnie 10 salt rounds.
        const hashedPassword = await bcrypt.hash(password, 10);
        // Zakładamy, że istnieje tabela "users" z kolumnami: id, username, password.
        await query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }
    try {
        const result = await query("SELECT * FROM users WHERE username = ?", [username]);
        if (result.length === 0) {
            return res.status(400).json({ error: 'Wprowadzono złą nazwę uzytkownika lub hasło.' });
        }
        const user = result[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ error: 'Wprowadzono złą nazwę uzytkownika lub hasło.' });
        }
        res.json({ message: 'Logged in successfully.', user: { id: user.id, username: user.username } });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint do zgłaszania nowych gier przez użytkowników
app.post("/api/games/submit", async (req, res) => {
    const { name, description, releaseDate } = req.body;
    const userId = req.body.userId;
    
    if (!userId) {
        return res.status(401).json({ error: "Musisz być zalogowany, aby dodać grę" });
    }
    
    if (!name) {
        return res.status(400).json({ error: "Nazwa gry jest wymagana" });
    }
    
    try {
        // Sprawdź, czy gra o tej nazwie już istnieje w głównej tabeli
        const existingGame = await query("SELECT id FROM games WHERE name = ?", [name]);
        if (existingGame.length > 0) {
            return res.status(400).json({ error: "Gra o takiej nazwie już istnieje" });
        }
        
        // Sprawdź, czy gra o tej nazwie czeka na zatwierdzenie
        const pendingGame = await query(
            "SELECT id FROM pending_games WHERE name = ? AND status = 'pending'", 
            [name]
        );
        if (pendingGame.length > 0) {
            return res.status(400).json({ error: "Gra o takiej nazwie już oczekuje na zatwierdzenie" });
        }
        
        // Wszystko OK, dodaj grę do oczekujących
        await query(
            "INSERT INTO pending_games (name, description, release_date, submitted_by) VALUES (?, ?, ?, ?)",
            [name, description, releaseDate, userId]
        );
        
        res.status(201).json({ message: "Gra została zgłoszona i oczekuje na zatwierdzenie przez moderatora." });
    } catch (error) {
        console.error("Error submitting game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint dla moderatorów do pobierania oczekujących gier
app.get("/api/games/pending", async (req, res) => {
    const userId = req.query.userId;
    
    try {
        // Sprawdź, czy użytkownik jest moderatorem
        const userCheck = await query("SELECT role FROM users WHERE id = ?", [userId]);
        if (userCheck.length === 0 || (userCheck[0].role !== 'moderator' && userCheck[0].role !== 'admin')) {
            return res.status(403).json({ error: "Brak uprawnień" });
        }
        
        const pendingGames = await query(`
            SELECT pg.*, u.username as submitted_by_username
            FROM pending_games pg
            JOIN users u ON pg.submitted_by = u.id
            WHERE pg.status = 'pending'
            ORDER BY pg.submission_date DESC
        `);
        
        res.json(pendingGames);
    } catch (error) {
        console.error("Error fetching pending games:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint dla moderatorów do zatwierdzania gier
app.post("/api/games/approve/:id", async (req, res) => {
    const gameId = req.params.id;
    const userId = req.body.userId;
    
    try {
        // Sprawdź, czy użytkownik jest moderatorem
        const userCheck = await query("SELECT role FROM users WHERE id = ?", [userId]);
        if (userCheck.length === 0 || (userCheck[0].role !== 'moderator' && userCheck[0].role !== 'admin')) {
            return res.status(403).json({ error: "Brak uprawnień" });
        }
        
        // Pobierz dane gry
        const gameData = await query("SELECT * FROM pending_games WHERE id = ?", [gameId]);
        if (gameData.length === 0) {
            return res.status(404).json({ error: "Gra nie została znaleziona" });
        }
        
        const game = gameData[0];
        
        // Sprawdź, czy gra o tej nazwie już istnieje
        const existingGame = await query("SELECT id FROM games WHERE name = ?", [game.name]);
        if (existingGame.length > 0) {
            await query("UPDATE pending_games SET status = 'rejected' WHERE id = ?", [gameId]);
            return res.status(400).json({ error: "Gra o takiej nazwie już istnieje w bazie danych" });
        }
        
        // Dodaj grę do głównej tabeli gier
        await query(
            "INSERT INTO games (name, rating_sum, rating_count) VALUES (?, 0, 0)",
            [game.name]
        );
        
        // Zaktualizuj status w tabeli pending_games
        await query(
            "UPDATE pending_games SET status = 'approved' WHERE id = ?",
            [gameId]
        );
        
        // Inwalidacja cache
        gameCache.del("games");
        
        res.json({ message: "Gra została zatwierdzona" });
    } catch (error) {
        console.error("Error approving game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint dla moderatorów do odrzucania gier
app.post("/api/games/reject/:id", async (req, res) => {
    const gameId = req.params.id;
    const userId = req.body.userId;
    
    try {
        // Sprawdź, czy użytkownik jest moderatorem
        const userCheck = await query("SELECT role FROM users WHERE id = ?", [userId]);
        if (userCheck.length === 0 || (userCheck[0].role !== 'moderator' && userCheck[0].role !== 'admin')) {
            return res.status(403).json({ error: "Brak uprawnień" });
        }
        
        // Zaktualizuj status w tabeli pending_games
        await query(
            "UPDATE pending_games SET status = 'rejected' WHERE id = ?",
            [gameId]
        );
        
        res.json({ message: "Gra została odrzucona" });
    } catch (error) {
        console.error("Error rejecting game:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Zaktualizuj endpoint do pobierania danych użytkownika
app.get("/api/users/:id", async (req, res) => {
    const userId = req.params.id;
    
    try {
        const userData = await query(`
            SELECT u.id, u.username, u.role, u.created_at, p.bio
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
        `, [userId]);
        
        if (userData.length === 0) {
            return res.status(404).json({ error: "Użytkownik nie istnieje" });
        }
        
        res.json(userData[0]);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint do pobierania rozszerzonych danych profilu użytkownika
app.get("/api/users/:id/profile", async (req, res) => {
    const userId = req.params.id;
    
    try {
        // Pobierz podstawowe dane użytkownika
        const userData = await query(`
            SELECT id, username, role, created_at
            FROM users 
            WHERE id = ?
        `, [userId]);
        
        if (userData.length === 0) {
            return res.status(404).json({ error: "Użytkownik nie istnieje" });
        }
        
        const user = userData[0];
        
        // Pobierz dane z tabeli user_profiles, jeśli istnieje
        let bioData = null;
        try {
            bioData = await query(`
                SELECT bio 
                FROM user_profiles 
                WHERE user_id = ?
            `, [userId]);
        } catch (error) {
            console.log("user_profiles table may not exist yet:", error.message);
        }
        
        // Pobierz liczbę ocenionych gier przez użytkownika
        let ratedGamesCount = 0;
        try {
            const ratedGamesResult = await query(`
                SELECT COUNT(*) as count 
                FROM game_votes 
                WHERE user_id = ?
            `, [userId]);
            ratedGamesCount = ratedGamesResult[0].count;
        } catch (error) {
            console.log("game_votes table may not exist yet:", error.message);
        }
        
        // Pobierz liczbę zgłoszonych gier przez użytkownika
        let submittedGamesCount = 0;
        try {
            const submittedGamesResult = await query(`
                SELECT COUNT(*) as count 
                FROM pending_games 
                WHERE submitted_by = ?
            `, [userId]);
            submittedGamesCount = submittedGamesResult[0].count;
        } catch (error) {
            console.log("pending_games table may not exist yet:", error.message);
        }
        
        // Pobierz listę ocenionych gier
        let ratedGames = [];
        try {
            ratedGames = await query(`
                SELECT g.id, g.name, gv.rating, 
                       IF(g.rating_count > 0, g.rating_sum/g.rating_count, 0) AS average_rating
                FROM game_votes gv
                JOIN games g ON gv.game_id = g.id
                WHERE gv.user_id = ?
                ORDER BY gv.created_at DESC
                LIMIT 10
            `, [userId]);
        } catch (error) {
            console.log("Error fetching rated games:", error.message);
        }
        
        // Zwróć kompletne dane profilu
        res.json({
            ...user,
            bio: bioData && bioData.length > 0 ? bioData[0].bio : null,
            stats: {
                ratedGamesCount,
                submittedGamesCount,
            },
            ratedGames
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint do aktualizacji profilu użytkownika
app.put("/api/users/:id/profile", async (req, res) => {
    const userId = req.params.id;
    const { bio, requesterId } = req.body;
    
    // Sprawdź czy użytkownik aktualizuje własny profil
    if (parseInt(userId) !== parseInt(requesterId)) {
        return res.status(403).json({ error: "Nie masz uprawnień do edycji tego profilu" });
    }
    
    try {
        // Sprawdź czy użytkownik istnieje
        const userCheck = await query("SELECT id FROM users WHERE id = ?", [userId]);
        if (userCheck.length === 0) {
            return res.status(404).json({ error: "Użytkownik nie istnieje" });
        }
        
        // Sprawdź czy tabela user_profiles istnieje, jeśli nie - utwórz ją
        await query(`
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INT PRIMARY KEY,
                bio TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `);
        
        // Sprawdź czy profil już istnieje
        const profileCheck = await query("SELECT user_id FROM user_profiles WHERE user_id = ?", [userId]);
        
        if (profileCheck.length === 0) {
            // Utwórz nowy profil
            await query("INSERT INTO user_profiles (user_id, bio) VALUES (?, ?)", [userId, bio]);
        } else {
            // Aktualizuj istniejący profil
            await query("UPDATE user_profiles SET bio = ? WHERE user_id = ?", [bio, userId]);
        }
        
        res.json({ message: "Profil został zaktualizowany" });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Endpoint do wyszukiwania gier
app.get("/api/games/search", async (req, res) => {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
        return res.json([]);
    }
    
    try {
        // Wyszukujemy gry, których nazwa zawiera podaną frazę
        const games = await query(`
            SELECT id, name, release_date, rating_sum, rating_count
            FROM games
            WHERE name LIKE ?
            ORDER BY 
                CASE 
                    WHEN name LIKE ? THEN 0
                    WHEN name LIKE ? THEN 1
                    ELSE 2
                END,
                name ASC
            LIMIT 20
        `, [`%${searchQuery}%`, `${searchQuery}%`, `%${searchQuery}`]);
        
        res.json(games);
    } catch (error) {
        console.error("Error searching games:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});