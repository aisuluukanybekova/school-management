const express = require('express');
const router = express.Router();
const controller = require('../controllers/lessonTopic-controller');

router.post('/', controller.saveTopics);
router.get('/', controller.getTopics);

module.exports = router;
