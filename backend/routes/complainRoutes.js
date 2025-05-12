const express = require('express');
const router = express.Router();
const {
  complainCreate,
  complainList,
  complainDelete
} = require('../controllers/complain-controller');

router.post('/', complainCreate);
router.get('/school/:schoolId', complainList);
router.delete('/:id', complainDelete);

module.exports = router;
