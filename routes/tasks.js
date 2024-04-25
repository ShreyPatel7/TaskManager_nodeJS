const express = require('express');
const Task = require('../models/task');

const router = express.Router();

// List all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render('tasks/index', { tasks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add a new task
router.post('/', async (req, res) => {
  const { title, description, dueDate, priority } = req.body;
  try {
    await Task.create({ title, description, dueDate, priority });
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Task.findByIdAndDelete(id);
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
