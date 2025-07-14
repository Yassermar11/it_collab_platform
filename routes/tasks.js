const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Task Model
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending',
  },
  due_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  project_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'tasks',
  timestamps: false,
});

// Get all tasks for the current user
router.get('/', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const tasks = await Task.findAll({
      where: {
        assigned_to: req.session.user.id
      },
      attributes: [
        'id',
        'name',
        'description',
        'due_date',
        'status',
        'project_id'
      ],
      order: [['created_at', 'DESC']]
    });

    // Format tasks for the frontend
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.name || 'Sans titre',
      description: task.description || '',
      dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
      status: task.status === 'in_progress' ? 'inprogress' : (task.status || 'pending'),
      projectId: task.project_id
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Error fetching tasks', error: error.message });
  }
});

// Update task status
router.put('/:id', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { status } = req.body;
    const taskId = req.params.id;

    const task = await Task.findOne({
      where: {
        id: taskId,
        assigned_to: req.session.user.id
      }
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or not accessible' });
    }

    task.status = status;
    await task.save();

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task', error: error.message });
  }
});

module.exports = router;
