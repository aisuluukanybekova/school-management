const router = require('express').Router();
const { createTerm, getTerms, updateTerm } = require('../controllers/term-controller');

router.post('/', createTerm);
router.get('/:schoolId', getTerms);
router.put('/:id', updateTerm);

module.exports = router;
