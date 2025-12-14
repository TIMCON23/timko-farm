const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { pool } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login Endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Невірне ім\'я користувача або пароль' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Невірне ім\'я користувача або пароль' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );

        res.json({ token, message: 'Успішний вхід' });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Initialize Database
async function initDb() {
    try {
        // Orders Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50) NOT NULL,
                items JSONB NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Products Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                code VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                unit VARCHAR(20),
                image_style TEXT
            );
        `);

        // Users Table (for Admin)
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin'
            );
        `);

        // Articles Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(50) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(50),
                image_style TEXT
            );
        `);

        // Advice Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS advice (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                content TEXT NOT NULL
            );
        `);

        // SEEDING DATA

        // Seed Products if empty
        const productsCount = await pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(productsCount.rows[0].count) === 0) {
            const seedQuery = `
                INSERT INTO products (code, name, description, price, unit, image_style)
                VALUES 
                ('vegetables', 'Овочі з теплиць', 'Помідори, огірки, перець, баклажани, зелень - все вирощене органічно', 50.00, 'кг', 'background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);'),
                ('eggs', 'Яйця та м''ясо птиці', 'Свіжі домашні яйця та якісне м''ясо від курей вільного вигулу', 70.00, 'дес', 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);'),
                ('milk', 'Козяче молоко', 'Корисне козяче молоко та молочні продукти високої якості', 100.00, 'л', 'background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);')
            `;
            await pool.query(seedQuery);
            console.log('Database initialized: products seeded');
        }

        // Seed Users if empty
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        if (parseInt(usersCount.rows[0].count) === 0) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash('admin123', salt); // Default password: admin123
            await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
            console.log('Database initialized: admin user seeded');
        }

        // Seed Articles if empty
        const articlesCount = await pool.query('SELECT COUNT(*) FROM articles');
        if (parseInt(articlesCount.rows[0].count) === 0) {
            const articlesSeed = [
                {
                    slug: 'greenhouse',
                    title: 'Органічне вирощування овочів у теплицях',
                    content: `<h2>Органічне вирощування овочів у теплицях</h2><p>Органічне вирощування овочів у теплицях стає все більш популярним в Україні...</p>`, // Content truncated for brevity, but could be full
                    category: 'Теплиці',
                    image_style: "background: linear-gradient(135deg, rgba(74, 222, 128, 0.9), rgba(22, 163, 74, 0.9)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%234ade80%22 width=%22100%22 height=%22100%22/></svg>');"
                },
                {
                    slug: 'poultry',
                    title: 'Вирощування органічної птиці',
                    content: `<h2>Вирощування органічної птиці</h2><p>Вирощування органічної птиці в Україні є перспективним напрямком...</p>`,
                    category: 'Птахівництво',
                    image_style: "background: linear-gradient(135deg, rgba(251, 146, 60, 0.9), rgba(249, 115, 22, 0.9)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23fb923c%22 width=%22100%22 height=%22100%22/></svg>');"
                },
                {
                    slug: 'goats',
                    title: 'Утримання кіз на органічній фермі',
                    content: `<h2>Утримання кіз на органічній фермі</h2><p>Органічне козівництво в Україні є перспективним напрямком...</p>`,
                    category: 'Козівництво',
                    image_style: "background: linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(59, 130, 246, 0.9)), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%2360a5fa%22 width=%22100%22 height=%22100%22/></svg>');"
                }
            ];

            for (const article of articlesSeed) {
                await pool.query(
                    'INSERT INTO articles (slug, title, content, category, image_style) VALUES ($1, $2, $3, $4, $5)',
                    [article.slug, article.title, article.content, article.category, article.image_style]
                );
            }
            console.log('Database initialized: articles seeded');
        }

        // Seed Advice if empty
        const adviceCount = await pool.query('SELECT COUNT(*) FROM advice');
        if (parseInt(adviceCount.rows[0].count) === 0) {
            const adviceSeed = [
                { title: 'Підготовка ґрунту в теплиці', content: 'Використовуйте органічні добрива: біогумус, компост з гною та пташиного посліду. Застосовуйте біопрепарати...' },
                { title: 'Сівозміна - запорука успіху', content: 'Не садіть помідори після огірків, баклажанів або перцю. Кращі попередники - цибуля та бобові.' },
                { title: 'Природний захист від шкідників', content: 'Використовуйте ентомофагів, рослини-приманки та корисні бактерії.' },
                { title: 'Годівля птиці', content: 'Забезпечте курей органічними кормами та доступом до вигулу.' },
                { title: 'Комфорт для кіз', content: 'Приміщення має бути сухим, чистим, теплим, без протягів.' },
                { title: 'Органічна сертифікація', content: 'Дотримуйтесь вимог органічних стандартів: уникайте хімікатів, ведіть детальний облік.' }
            ];

            for (const advice of adviceSeed) {
                await pool.query('INSERT INTO advice (title, content) VALUES ($1, $2)', [advice.title, advice.content]);
            }
            console.log('Database initialized: advice seeded');
        }

        console.log('Database initialized: tables ready');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}


// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret_key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// --- PUBLIC APIs ---

// Get Products (Public)
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Articles (Public)
app.get('/api/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching articles:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Advice (Public)
app.get('/api/advice', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM advice ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching advice:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- ADMIN PROTECTED APIs ---

// Orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Manage Products
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { code, name, description, price, unit, image_style } = req.body;
        const result = await pool.query(
            'INSERT INTO products (code, name, description, price, unit, image_style) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [code, name, description, price, unit, image_style]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { code, name, description, price, unit, image_style } = req.body;
        const result = await pool.query(
            'UPDATE products SET code=$1, name=$2, description=$3, price=$4, unit=$5, image_style=$6 WHERE id=$7 RETURNING *',
            [code, name, description, price, unit, image_style, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Manage Articles
app.post('/api/articles', authenticateToken, async (req, res) => {
    try {
        const { slug, title, content, category, image_style } = req.body;
        const result = await pool.query(
            'INSERT INTO articles (slug, title, content, category, image_style) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [slug, title, content, category, image_style]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/articles/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { slug, title, content, category, image_style } = req.body;
        const result = await pool.query(
            'UPDATE articles SET slug=$1, title=$2, content=$3, category=$4, image_style=$5 WHERE id=$6 RETURNING *',
            [slug, title, content, category, image_style, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



// Create Order
app.post('/api/orders', async (req, res) => {
    try {
        const { customerName, customerPhone, items, totalPrice } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const query = `
            INSERT INTO orders (customer_name, customer_phone, items, total_price)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;

        const values = [customerName, customerPhone, JSON.stringify(items), totalPrice];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Order created successfully',
            orderId: result.rows[0].id
        });
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
