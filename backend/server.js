import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import cors from 'cors';

const app = express();
app.use(express.json());

const allowedOrigins = ['http://localhost:3000'];  // <-- Specify allowed origins
app.use(cors({
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
}));

const connection = new sqlite3.Database('./db/aplikasi.db')

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

function isValidId(id) {
  return /^\d+$/.test(id); // Checks if ID is a positive integer
}

//function for validating the email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

app.get('/api/user/:id', (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).send('Invalid user ID');
  }

  const query = `SELECT * FROM users WHERE id = ?`;
  connection.all(query, [req.params.id], (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.post('/api/user/:id/change-email', (req, res) => {
  const newEmail = req.body.email;

  if (!isValidId(req.params.id)) {
    return res.status(400).send('Invalid user ID');
  }
  if (!isValidEmail(newEmail)) {
    return res.status(400).send('Invalid email format');
  }

  const query = `UPDATE users SET email = ? WHERE id = ?`;

  connection.run(query, [newEmail, req.params.id], function (err) {
    if (err) throw err;
    if (this.changes === 0 ) res.status(404).send('User not found');
    else res.status(200).send('Email updated successfully');
  });

});

app.get('/api/file', (req, res) => {
  const filePath = path.join(__dirname, 'files', req.query.name);
  res.sendFile(filePath);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
