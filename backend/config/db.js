const { Pool } = require('pg');

// We are putting your real connection info directly here
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'hostel_db',
    password: 'Sharu@123', // ✏️ Type your real pgAdmin password inside these quotes!
    port: 5432,
});

pool.on('connect', () => {
    console.log('PostgreSQL connected successfully! 🐘');
});

module.exports = pool;