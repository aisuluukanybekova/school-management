const express = require('express');
const router = express.Router();
const Subject = require('../models/subjectSchema');
const {
  createSubject,
  getSubjectsBySchool,
  getSubjectsByClass,
  getSubjectDetail,
  updateSubject,
  deleteSubject,
  deleteSubjects,
  deleteSubjectsByClass,
  getSubjectWithTopics
} = require('../controllers/subject-controller');

// === Более специфичные маршруты ===

router.get('/school/:id', getSubjectsBySchool);
router.get('/class/:id', getSubjectsByClass);
router.delete('/school/:id', deleteSubjects);
router.delete('/class/:id', deleteSubjectsByClass);

// === Специальный маршрут для тем предмета ===
// ДОЛЖЕН БЫТЬ ДО /:id
router.get('/:id/with-topics', getSubjectWithTopics);

// === Общие маршруты ===

router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', getSubjectDetail);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;
