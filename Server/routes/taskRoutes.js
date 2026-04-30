const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/user');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const isPastDeadline = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < getStartOfToday();
};

const applyDeadlineStatus = (task) => {
  if (task.status === 'Done') return;

  if (isPastDeadline(task.dueDate)) {
    task.status = 'Overdue';
    return;
  }

  if (task.status === 'Overdue') {
    task.status = 'Todo';
  }
};

const markOverdueTasks = () =>
  Task.updateMany(
    { dueDate: { $lt: getStartOfToday() }, status: { $ne: 'Done' } },
    { $set: { status: 'Overdue' } }
  );

// Get all tasks (Protected: Any logged-in user)
router.get('/', protect, async (req, res) => {
  try {
    await markOverdueTasks();

    const tasks = await Task.find().populate('assignedTo', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all users so Admin can assign them (Admin Only)
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('name _id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a task (Protected: Admin Only)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      assignedTo: assignedTo || undefined,
      dueDate,
    });
    applyDeadlineStatus(task);
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit a task (Protected: Admin Only)
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.assignedTo = assignedTo || undefined;
    task.dueDate = dueDate || task.dueDate;

    applyDeadlineStatus(task);

    const updatedTask = await task.save();
    const populatedTask = await updatedTask.populate('assignedTo', 'name email');
    res.json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task status (Protected: Any logged-in user)
router.put('/:id', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Todo', 'In Progress', 'Done'];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid task status' });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isAdmin = req.user.role === 'Admin';
    const isAssignedUser = task.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        message: 'Only admins or the assigned user can update this task',
      });
    }

    task.status = status || task.status;
    applyDeadlineStatus(task);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task (Protected: Admin Only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
