const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database.sqlite');

// Регистрация нового пользователя
router.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Хеширование пароля
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Вставка нового пользователя в базу данных
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(400).send('Пользователь с таким именем уже существует');
            }
            return res.status(500).send('Ошибка при регистрации');
        }
        res.status(201).send('Пользователь зарегистрирован');
    });
});

// Вход пользователя
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Поиск пользователя в базе данных
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user) {
            return res.status(401).send('Неверные учетные данные');
        }

        // Сравнение пароля
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Неверные учетные данные');
        }

        // Создание токена
        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: '1h' });
        res.json({ token });
    });
});

module.exports = router;
