const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

// Routes mapping to the controller functions
router.post('/add', expenseController.addExpense);
router.get('/dashboard', expenseController.getDashboardStats);

// The crucial line that makes it work!
module.exports = router;