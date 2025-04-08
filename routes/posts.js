const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken'); // Импортируем библиотеку jsonwebtoken

const router = express.Router();
const db = new sqlite3.Database('./database.sqlite');

// Middleware для проверки токена
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send('Токен необходим');

    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) return res.status(401).send('Неверный токен');
        req.userId = decoded.id; // Сохраняем ID пользователя для дальнейшего использования
        next();
    });
};

// Получение всех постов
router.get('/', (req, res) => {
    db.all(`SELECT posts.*, users.username FROM posts JOIN users ON posts.author = users.id`, [], (err, posts) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(posts);
    });
});

// Создание нового поста (только для авторизованных пользователей)
router.post('/', authenticate, (req, res) => {
    const { content } = req.body;

    db.run(`INSERT INTO posts (content, author) VALUES (?, ?)`, [content, req.userId], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(201).json({ id: this.lastID, content, author: req.userId });
    });
});

module.exports = router;
