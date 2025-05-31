const express = require('express');
const router = express.Router();
const CabinetController = require('../controllers/cabinet-controller');

router.get('/:schoolId', CabinetController.getCabinets);
router.post('/', CabinetController.createCabinet);
router.delete('/:id', CabinetController.deleteCabinet);

module.exports = router;
