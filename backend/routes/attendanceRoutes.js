const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance-controller');

const {
  getAttendance,
  saveAttendance,
  getStudentAttendance,
  getAttendanceReport,
  getAttendanceDebug
} = attendanceController;

router.get('/', getAttendance);
router.post('/', saveAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/report', getAttendanceReport);
router.get('/report/debug', getAttendanceDebug);

module.exports = router;


