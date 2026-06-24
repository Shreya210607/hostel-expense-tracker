const express = require('express');
const router = express.Router();
const { askAssistant } = require('../controllers/aiController');

// Pathway for the frontend to post a chat question
router.post('/ask', askAssistant);

module.exports = router;