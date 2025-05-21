const express = require('express');
const router = express.Router();
const {
  createTeacherComplain,
  getTeacherComplainsBySchool,
  deleteTeacherComplain,
} = require('../controllers/teacherComplain-controller');

router.post('/', createTeacherComplain);
router.get('/school/:schoolId', getTeacherComplainsBySchool);
router.delete('/:id', deleteTeacherComplain);

module.exports = router;
