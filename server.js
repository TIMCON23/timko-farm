// 1. ПІДКЛЮЧЕННЯ МОДУЛІВ
const express = require('express');
const cors = require('cors'); // Дозволяє запити з різних доменів
const bodyParser = require('body-parser'); // Парсинг JSON-даних у запитах
const path = require('path'); // Робота зі шляхами файлової системи
const bcrypt = require('bcryptjs'); // Хешування паролів
const jwt = require('jsonwebtoken'); // Створення токенів безпеки
const { pool } = require('./db'); // Підключення до бази даних (файл db.js)
require('dotenv').config(); // Завантаження змінних з файлу .env

const app = express();
const PORT = process.env.PORT || 10000; // Порт для Render

// 2. НАЛАШТУВАННЯ MIDDLEWARE
app.use(cors());
app.use(bodyParser.json());

// 3. СТАТИЧНІ ФАЙЛИ (ВАЖЛИВО: папка public)
// Вказуємо, що всі файли фронтенду лежать у папці public
app.use(express.static(path.join(__dirname, 'public')));

// 4. МІДЛВЕР ДЛЯ ЗАХИСТУ АДМІН-МАРШРУТІВ
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Отримуємо токен з заголовка

    if (!token) return res.status(401).json({ error: 'Доступ заборонено (відсутній токен)' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Токен недійсний або прострочений' });
        req.user = user;
        next(); // Переходимо до наступної функції
    });
}

// 5. API ДЛЯ АВТЕНТИФІКАЦІЇ (ЛОГІН)
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Користувача не знайдено' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Невірний пароль' });
        }

        // Створюємо JWT токен на 24 години
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.json({ token, message: 'Вхід успішний' });
    } catch (err) {
        console.error('Помилка логіну:', err);
        res.status(500).json({ error: 'Помилка на сервері' });
    }
});

// 6. ПУБЛІЧНІ API (БЕЗ ТОКЕНА)
// Отримання товарів, статей та порад для відвідувачів
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, items, totalPrice } = req.body;
        const query = `INSERT INTO orders (customer_name, customer_phone, items, total_price) VALUES ($1, $2, $3, $4) RETURNING id`;
        const result = await pool.query(query, [customerName, customerPhone, JSON.stringify(items), totalPrice]);
        res.status(201).json({ message: 'Замовлення прийнято', orderId: result.rows[0].id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 7. ЗАХИЩЕНІ API (ТІЛЬКИ ДЛЯ АДМІНА)
// Отримання списку замовлень в адмінці
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Видалення товару
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ message: 'Товар видалено' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Додавання товару
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { code, name, description, price, unit, image_style } = req.body;
        const result = await pool.query(
            'INSERT INTO products (code, name, description, price, unit, image_style) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [code, name, description, price, unit, image_style]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Редагування товару
app.put('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const { code, name, description, price, unit, image_style } = req.body;
        const result = await pool.query(
            'UPDATE products SET code=$1, name=$2, description=$3, price=$4, unit=$5, image_style=$6 WHERE id=$7 RETURNING *',
            [code, name, description, price, unit, image_style, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Додавання статті
app.post('/api/articles', authenticateToken, async (req, res) => {
    try {
        const { slug, title, content, category, image_style } = req.body;
        const result = await pool.query(
            'INSERT INTO articles (slug, title, content, category, image_style) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [slug, title, content, category, image_style]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Редагування статті
app.put('/api/articles/:id', authenticateToken, async (req, res) => {
    try {
        const { slug, title, content, category, image_style } = req.body;
        const result = await pool.query(
            'UPDATE articles SET slug=$1, title=$2, content=$3, category=$4, image_style=$5 WHERE id=$6 RETURNING *',
            [slug, title, content, category, image_style, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Видалення статті
app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
        res.json({ message: 'Статтю видалено' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. РОУТИНГ СТОРІНОК (REDIRECTS)
// Ці маршрути дозволяють заходити на сторінки без розширення .html в URL
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-login.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cart.html')));

// 9. ІНІЦІАЛІЗАЦІЯ ТА ЗАПУСК
async function initDb() {
    try {
        // Створення таблиць, якщо їх немає
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, customer_name VARCHAR(255), customer_phone VARCHAR(50), items JSONB, total_price DECIMAL(10, 2), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
            CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, code VARCHAR(50) UNIQUE, name VARCHAR(255), description TEXT, price DECIMAL(10, 2), unit VARCHAR(20), image_style TEXT);
            CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE, password_hash VARCHAR(255), role VARCHAR(20) DEFAULT 'admin');
            CREATE TABLE IF NOT EXISTS articles (id SERIAL PRIMARY KEY, slug VARCHAR(50) UNIQUE, title VARCHAR(255), content TEXT, category VARCHAR(50), image_style TEXT);
            CREATE TABLE IF NOT EXISTS advice (id SERIAL PRIMARY KEY, title VARCHAR(255), content TEXT);
        `);

        // Перевірка та створення адміна
        const userCheck = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(userCheck.rows[0].count) === 0) {
            const hash = await bcrypt.hash(process.env.ADMIN_PASS || 'admin123', 10);
            await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [process.env.ADMIN_USER || 'admin', hash]);
            console.log('--- Database: Admin created ---');
        }
        console.log('--- Server: Database tables are ready ---');
    } catch (err) { console.error('DB Init Error:', err); }
}

// Стартуємо базу, потім сервер
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`--- SERVER LIVE: http://localhost:${PORT} ---`);
    });
});