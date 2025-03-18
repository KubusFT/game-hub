const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const mysql = require('mysql');
const request = require('supertest');
const app = express();
const util = require('util');
const PORT = process.env.PORT || 4000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
  }

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
	  cb(null, './uploads/');
	},
	filename: function(req, file, cb) {
		cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
	  }
  });
  
  const upload = multer({ storage: storage });
//MySQL

const connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'forum'
});

connection.connect((err) => {
	if (err) {
	  console.error('Error connecting to the database: ', err);
	  return;
	}
	console.log('Connected to the database');
  });

app.get('', (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query('SELECT * from users', (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                console.log(err)
            }

            // if(err) throw err
            console.log('The data from the table are: \n', rows)
        })
    })
})

const users = [];
const threadList = [];

const generateID = () => Math.random().toString(36).substring(2, 10);

app.post('/api/login', (req, res) => {
	const { email, password } = req.body;
  
	// Query the database for a user with the given email and password
	connection.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, results) => {
	  if (error) {
		console.error('Error querying the database: ', error);
		return;
	  }
  
	  if (results.length !== 1) {
		return res.json({
		  error_message: "Nieprawidłowe dane",
		});
	  }
  
	  res.json({
		message: "Zalogowano pomyślnie",
		id: results[0].id,
	  });
	});
  });

  app.post("/api/register", async (req, res) => {
	const { email, password, username, firstname, lastname, birthdate } = req.body; // Dodaj birthdate
	const id = generateID();
  
	connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
	  if (error) {
		console.error(error);
		return res.json({ error_message: 'An error occurred while creating the account.' });
	  }
  
	  if (results.length === 0) {
		connection.query('INSERT INTO users (id, email, password, username, firstname, lastname, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?)', [id, email, password, username, firstname, lastname, birthdate], (error, results) => { // Dodaj birthdate
		  if (error) {
			console.error(error);
			return res.json({ error_message: 'An error occurred while creating the account.' });
		  }
  
		  return res.json({ message: 'Konto zostało stworzone pomyślnie', id });
		});
	  } else {
		res.json({ error_message: 'Użytkownik już istnieje' });
	  }
	});
  });

  app.post("/api/create/thread", upload.single('file'), async (req, res) => {
	const { thread, userId, post, tags, product, opis, cena, numer } = req.body;
	const file = req.file; // Plik przesłany przez użytkownika
  
	if (!userId) {
	  return res.status(400).json({ error_message: 'userId cannot be null' });
	}
  
	let threadId = generateID();
	let createdAt = new Date(); // Get the current date and time
  
	connection.query('INSERT INTO threads (id, title, userId, post, created_at, tags, product, opis, cena, numer, filename) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [threadId, thread, userId, post, createdAt, tags, product, opis, cena, numer, req.file.filename], (error, results) => { // Add filename to the query
	  if (error) {
		console.error(error);
		return res.json({ error_message: 'An error occurred while creating the thread.' });
	  }
  
	  connection.query('INSERT INTO replies (threadId, text, userId) VALUES (?, ?, ?)', [threadId, 'Cześć! Przypominamy o przestrzeganiu zasad naszego forum. Nieprawidłowe korzystanie z forum może zakończyć się usunięciem posta.', 'pkpuyl4l'], (error, results) => {
		if (error) {
		  console.error(error);
		  return res.json({ error_message: 'An error occurred while creating the thread.' });
		}
  
		connection.query('SELECT * FROM threads', (error, results) => {
		  if (error) {
			console.error(error);
			return res.json({ error_message: 'An error occurred while fetching the threads.' });
		  }
		  return res.json({ threads: results, message: 'Wątek został stworzony pomyślnie.' });
		});
	  });
	});
  });
  
  app.get('/api/threads', (req, res) => {
    const tag = req.query.tag;
    let sql = `SELECT 
               (SELECT users.username FROM users WHERE users.id = threads.userId) AS authorName,
               threads.*, 
               users.id AS authorId,
               (SELECT COUNT(*) FROM likes WHERE likes.threadId = threads.id) AS likesCount,
               (SELECT COUNT(*) FROM replies WHERE replies.threadId = threads.id) AS repliesCount
               FROM threads 
               INNER JOIN users ON users.id = threads.userId
               WHERE tags LIKE ?`;
    let query = connection.query(sql, [`%${tag}%`], (err, results) => {
        if(err) throw err;
        res.send(results);
    });
});

  app.get("/api/all/threads", (req, res) => {
	connection.query(`
	SELECT threads.*, users.username AS authorName, users.id AS authorId,
	(SELECT COUNT(*) FROM likes WHERE likes.threadId = threads.id) AS likesCount,
	(SELECT COUNT(*) FROM replies WHERE replies.threadId = threads.id) AS repliesCount
	FROM threads 
	JOIN users ON threads.userId = users.id`, 
	  (error, results) => {
		if (error) {
		  console.error(error);
		  return res.json({ error_message: 'An error occurred while fetching the threads.' });
		}
		return res.json({ threads: results });
	  }
	);
  });
  
  app.post("/api/thread/like", (req, res) => {
	const { threadId, userId } = req.body;
  
	connection.query('SELECT * FROM likes WHERE threadId = ? AND userId = ?', [threadId, userId], (error, results) => {
	  if (error) {
		console.error(error);
		return res.json({ error_message: 'An error occurred while liking the thread.' });
	  }
  
	  if (results.length === 0) {
		connection.query('INSERT INTO likes (threadId, userId) VALUES (?, ?)', [threadId, userId], (error, results) => {
		  if (error) {
			console.error(error);
			return res.json({ error_message: 'An error occurred while liking the thread.' });
		  }
  
		  return res.json({ message: 'Polubiono post!' });
		});
	  } else {
		return res.json({ error_message: 'Możesz polubić ten post tylko raz!' });
	  }
	});
  });
  
  app.post("/api/thread/replies", (req, res) => {
	const { id } = req.body;
	connection.query(`
	SELECT
	threads.product,
	threads.opis,
	threads.cena,
	threads.numer, 
	threads.title, 
	threads.post,
	threads.filename, 
	threads.created_at AS threadCreatedAt,
	threads.youtubeLink,
	threadUsers.username AS threadAuthorName, 
	threadUsers.id AS threadAuthorId, 
	replies.text AS replyText,
	replies.created_at AS replyCreatedAt,
	replyUsers.username AS replyAuthorName, 
	replyUsers.id AS replyAuthorId
	FROM threads 
	LEFT JOIN users AS threadUsers ON threads.userId = threadUsers.id 
	LEFT JOIN replies ON replies.threadId = threads.id 
	LEFT JOIN users AS replyUsers ON replies.userId = replyUsers.id 
	WHERE threads.id = ?
	ORDER BY replies.created_at ASC`, 
	  [id], 
	  (error, results) => {
		if (error) {
		  console.error(error);
		  return res.json({ error_message: 'An error occurred while fetching the replies.' });
		}
		
		// Check if the first reply is empty
		if (results[0] && results[0].replyId === null) {
		  results.shift(); // Remove the first element from the results
		}
  
		// Get the author of the post
		let threadAuthor = null;
		let replies = [];
		if (results[0]) {
			threadAuthor = { id: results[0].threadAuthorId, name: results[0].threadAuthorName };
			replies = results.map(result => ({
			  text: result.replyText,
			  createdAt: result.replyCreatedAt,
			  author: { id: result.replyAuthorId, name: result.replyAuthorName }
			}));
		}
  
		return res.json({ replies: replies, title: results[0]?.title, post: results[0]?.post, threadAuthor: threadAuthor, youtubeLink: results[0]?.youtubeLink, product: results[0]?.product, opis: results[0]?.opis, cena: results[0]?.cena, numer: results[0]?.numer, filename: results[0]?.filename });
	  }
	);
  });

  app.get("/api/thread/replies/:id", (req, res) => {
    const { id } = req.params;
    connection.query(`
    SELECT
    threads.id,
    threads.title, 
    threads.post, 
    threads.created_at AS threadCreatedAt,
    threads.filename,
    users.username AS threadAuthorName, 
    users.id AS threadAuthorId
    FROM threads 
    LEFT JOIN users ON threads.userId = users.id 
    WHERE threads.id = ?`, 
      [id], 
      (error, results) => {
        if (error) {
          console.error(error);
          return res.json({ error_message: 'An error occurred while fetching the thread.' });
        }
  
        const thread = results[0];
  
        connection.query(`
        SELECT
        replies.text,
        replies.created_at AS replyCreatedAt,
        users.username AS replyAuthorName, 
        users.id AS replyAuthorId
        FROM replies 
        LEFT JOIN users ON replies.userId = users.id 
        WHERE replies.threadId = ?
        ORDER BY replies.created_at ASC`, 
          [id], 
          (error, results) => {
            if (error) {
              console.error(error);
              return res.json({ error_message: 'An error occurred while fetching the replies.' });
            }
			console.log(thread);
            return res.json({ ...thread, replies: results });
          }
        );
      }
    );
});
  
  app.post("/api/create/reply", async (req, res) => {
	const { id, userId, reply } = req.body;
  
	if (!userId) {
	  return res.status(400).json({ error_message: 'userId cannot be null' });
	}
  
	let createdAt = new Date(); // Get the current date and time
  
	connection.query('INSERT INTO replies (threadId, text, userId, created_at) VALUES (?, ?, ?, ?)', [id, reply, userId, createdAt], (error, results) => { // Add createdAt to the query
	  if (error) {
		console.error(error);
		return res.json({ error_message: 'An error occurred while creating the reply.' });
	  }
  
	  connection.query('SELECT * FROM replies WHERE threadId = ?', [id], (error, results) => {
		if (error) {
		  console.error(error);
		  return res.json({ error_message: 'An error occurred while fetching the replies.' });
		}
		return res.json({ replies: results, message: 'Odpowiedź została stworzona pomyślnie.' });
	  });
	});
  });

  connection.query = util.promisify(connection.query);

  app.get('/api/user/:id', async (req, res) => {
	try {
	  const result = await connection.query('SELECT id, username, email, firstname, lastname, birthdate, bio FROM users WHERE id = ?', [req.params.id]);
	  if (result.length > 0) {
		res.json(result[0]);
	  } else {
		res.status(404).send('User not found');
	  }
	} catch (err) {
	  console.error(err);
	  res.status(500).send('Server error');
	}
  });

  app.put('/api/user/:id', async (req, res) => {
    const { username, email, firstname, lastname, birthdate, bio } = req.body;
    try {
        const result = await connection.query('UPDATE users SET username = ?, email = ?, firstname = ?, lastname = ?, birthdate = ?, bio = ? WHERE id = ?', [username, email, firstname, lastname, birthdate, bio, req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'User updated successfully' });
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/api/thread/:id', async (req, res) => {
    try {
        const result = await connection.query('DELETE FROM threads WHERE id = ?', [req.params.id]);
        if (result.affectedRows > 0) {
            res.json({ message: 'Wątek został usunięty pomyślnie' });
        } else {
            res.status(404).send('Nie znaleziono wątku');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Endpoint to get all messages
app.get('/api/shoutbox/messages', async (req, res) => {
    try {
        const result = await connection.query('SELECT messages.message, users.username, messages.userId FROM messages JOIN users ON messages.userId = users.id;');
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Endpoint to send a message
app.post('/api/shoutbox/send', async (req, res) => {
    const { userId, message } = req.body;
    try {
        const result = await connection.query('INSERT INTO messages (userId, message) VALUES (?, ?)', [userId, message]);
        res.json({ message: 'Wiadomość została wysłana pomyślnie' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.post('/api/thread/addYoutubeLink', (req, res) => {
    const { id, youtubeLink } = req.body;
    const sql = 'UPDATE threads SET youtubeLink = ?, isEdited = true WHERE id = ?';

    connection.query(sql, [youtubeLink, id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Link do YouTube został dodany' });
    });
});

app.get('/api/thread/:id', (req, res) => {
	let sql = 'SELECT * FROM threads WHERE id = ?';
	let query = connection.query(sql, [req.params.id], (err, result) => {
	  if (err) throw err;
	  res.send(result);
	});
  });

  app.put('/api/thread/:id', (req, res) => {
	let sql = 'UPDATE threads SET title = ?, post = ?, isEdited = true WHERE id = ?';
	let query = connection.query(sql, [req.body.title, req.body.post, req.params.id], (err, result) => {
	  if (err) throw err;
	  res.send(result);
	});
  });

app.listen(PORT, () => {
	console.log(`Server listening on ${PORT}`);
});