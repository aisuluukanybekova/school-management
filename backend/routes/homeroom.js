const express = require('express');
const router = express.Router();
const { getHomeroomSummary } = require('../controllers/homeroom-controller');

router.get('/class/:classId/summary', getHomeroomSummary);

module.exports = router;
