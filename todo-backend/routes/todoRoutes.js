const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const History = require('../models/History');
const verifyToken = require('../middleware/verifyToken');

// Middleware to check if user is authenticated
router.use(verifyToken);

// Add Todo
router.post('/', async (req, res) => {
  try {
    const { title, description, isImportant, dueDate } = req.body;
    const userId = req.user.id; // From the token
    console.log("req",req.body);
    const newTodo = new Todo({
      userId,
      title,
      description,
      isImportant,
      dueDate
    });

    await newTodo.save();
    res.status(201).json({ message: 'Todo added successfully', todo: newTodo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Todo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, isImportant, dueDate } = req.body;
    const userId = req.user.id;

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    // Update fields
    todo.title = title;
    todo.description = description;
    todo.isImportant = isImportant;
    todo.dueDate = dueDate;

    await todo.save();

    res.json({ message: 'Todo updated successfully', todo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Todos (for logged-in user)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const todos = await Todo.find({ userId, completed: false }).sort({ dueDate: 1 }); // Only show non-completed tasks
    // console.log("Sorted Todos:", todos.map(t => t.dueDate));
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark Todo as Completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    // Mark as completed
    todo.completed = true;
    await todo.save();

    // Move to History collection
    const completedTodo = new History({
      userId,
      title: todo.title,
      description: todo.description,
      isImportant: todo.isImportant,
      dueDate: todo.dueDate
    });

    await completedTodo.save();

    // Delete from Todo collection
    await todo.deleteOne();

    res.json({ message: 'Todo marked as completed and moved to history', todo: completedTodo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Todo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todo = await Todo.findOne({ _id: id, userId });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    await todo.deleteOne();
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
