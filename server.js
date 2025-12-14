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

// Initialize Database
async function initDb() {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(50) NOT NULL,
                items JSONB NOT NULL,
                total_price DECIMAL(10, 2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await pool.query(createTableQuery);
        console.log('Database initialized: orders table ready');
    } catch (err) {
        console.error('Error initializing database:', err);
    }
}


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
