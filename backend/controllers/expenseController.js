const pool = require('../config/db'); // Import PostgreSQL pool
let mockBudget = 8000; // Default budget for a hostel student

// Add a new expense to Postgres
exports.addExpense = async (req, res) => {
    try {
        const { amount, category, description } = req.body;
        
        // SQL query to insert expense data
        const queryText = 'INSERT INTO expenses(amount, category, description, date) VALUES($1, $2, $3, NOW()) RETURNING *';
        const values = [parseFloat(amount), category, description];
        
        const result = await pool.query(queryText, values);
        
        res.status(201).json({ 
            message: "Expense tracked successfully in Postgres!", 
            expense: result.rows[0] 
        });
    } catch (error) {
        console.error("Postgres Save Error:", error);
        res.status(500).json({ error: "Failed to save expense to PostgreSQL database." });
    }
};

// Calculate Safe Daily Spending Limit using SQL Data
exports.getDashboardStats = async (req, res) => {
    try {
        // Fetch all expenses from Postgres
        const result = await pool.query('SELECT * FROM expenses');
        const dbExpenses = result.rows;
        
        const totalSpent = dbExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
        const remainingBalance = mockBudget - totalSpent;

        // Calculate days left in the current month
        const today = new Date();
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const daysRemaining = lastDayOfMonth - today.getDate() + 1;
        
        // Core Feature: Safe Daily Limit
        const safeDailyLimit = remainingBalance > 0 ? (remainingBalance / daysRemaining).toFixed(2) : 0;
        
        // Smart Alert Generation
        let alertMessage = "Your wallet is breathing fine. Keep going!";
        if (safeDailyLimit < 150 && safeDailyLimit > 0) {
            alertMessage = "Warning: Budget getting tight. Stick to mess food!";
        } else if (remainingBalance <= 0) {
            alertMessage = "Alert: You are officially broke for the month!";
        }

        res.json({
            totalBudget: mockBudget,
            totalSpent,
            remainingBalance,
            daysRemaining,
            safeDailyLimit: parseFloat(safeDailyLimit),
            alertMessage
        });
    } catch (error) {
        console.error("Postgres Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard stats from database." });
    }
};