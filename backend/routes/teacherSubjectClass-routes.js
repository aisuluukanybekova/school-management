const express = require("express");
const {
  createTeacherSubjectClass,
  getAllTeacherSubjectClasses,
  updateTeacherSubjectClass,
  deleteTeacherSubjectClass,
  getTeachersWithSubjects,
  getSubjectsWithTeachersByClass,
  getClassesAndSubjectsByTeacher,
  getTeacherSubjectClassBySchool,
  getSubjectsByClass 
} = require("../controllers/teacherSubjectClass-controller");

const router = express.Router();
router.get('/school/:id', getTeacherSubjectClassBySchool);
router.post("/", createTeacherSubjectClass);
router.get("/", getAllTeacherSubjectClasses);
router.get("/grouped", getTeachersWithSubjects);
router.get("/assigned/:classId", getSubjectsWithTeachersByClass);
router.get("/by-teacher/:teacherId", getClassesAndSubjectsByTeacher);
router.get("/by-class/:classId", getSubjectsByClass); 
router.put("/:id", updateTeacherSubjectClass);
router.delete("/:id", deleteTeacherSubjectClass);

module.exports = router;
