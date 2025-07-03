const express = require('express');
const router = express.Router();
const History = require('../models/History');
const verifyToken = require('../middleware/verifyToken');

// Middleware to protect routes
router.use(verifyToken);

// Get Completed (History) Tasks
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await History.find({ userId }).sort({ completedAt: -1 }); // Latest completed tasks first

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/history/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const historyId = req.params.id;

    const result = await History.deleteOne({ _id: historyId, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'History not found or unauthorized' });
    }

    res.json({ message: 'History item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/history
router.delete('/', async (req, res) => {
  try {
    const userId = req.user.id;
    await History.deleteMany({ userId });

    res.json({ message: 'All history items cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
