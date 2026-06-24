const express = require('express');
const cors = require('cors');
const pool = require('./config/db'); // Import our Postgres connection pool
require('dotenv').config();

const expenseRoutes = require('./routers/expenseRoutes');
const aiRoutes = require('./routers/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Test DB Connection immediately on boot
pool.query('SELECT NOW()')
    .then(() => console.log("Database handshake complete."))
    .catch(err => console.error("Database handshake failed:", err));

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: "Backend kitchen is open and working!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
});