const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  isImportant: { type: Boolean, default: false },
  dueDate: { type: Date, required: true },
  completedAt: { type: Date, default: Date.now }, // Track when the task was completed
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('History', HistorySchema);
