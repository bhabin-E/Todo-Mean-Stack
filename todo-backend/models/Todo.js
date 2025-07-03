const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  isImportant: { type: Boolean, default: false },
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false }, // New field for completed tasks
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Todo', TodoSchema);
