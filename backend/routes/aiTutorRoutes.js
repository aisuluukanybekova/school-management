const express = require('express');
const router = express.Router();
const { askTutor } = require('../controllers/aiTutorController');

router.post('/ask', askTutor);

module.exports = router;
