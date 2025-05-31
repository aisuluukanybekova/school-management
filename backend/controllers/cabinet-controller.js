const Cabinet = require('../models/cabinetSchema');

exports.getCabinets = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const cabinets = await Cabinet.find({ schoolId });
    res.json({ success: true, cabinets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCabinet = async (req, res) => {
  try {
    const { schoolId, name } = req.body;
    if (!name || !schoolId) return res.status(400).json({ message: 'Имя и schoolId обязательны' });

    const cabinet = new Cabinet({ schoolId, name });
    await cabinet.save();
    res.status(201).json({ success: true, cabinet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCabinet = async (req, res) => {
  try {
    await Cabinet.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Кабинет удалён' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
