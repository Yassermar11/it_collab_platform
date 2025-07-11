const express = require('express');
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const isLogin = require('../middleware/isLogin');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  created_at: { type: DataTypes.DATE },
}, { tableName: 'users', timestamps: false });

const Project = sequelize.define('Project', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING },
  assigned_users: { type: DataTypes.STRING }, // CSV of user IDs
  status: { type: DataTypes.STRING }, // Add status field for project stats
}, { tableName: 'projects', timestamps: false });

const Task = sequelize.define('Task', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING },
  assigned_to: { type: DataTypes.INTEGER },
  due_date: { type: DataTypes.DATE },
}, { tableName: 'tasks', timestamps: false });

// GET /api/home - dashboard data (protected)
router.get('/api/home', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // Get user info
    const user = await User.findByPk(userId);
    if (!user) {
      console.error('User not found for id:', userId);
      return res.status(404).json({ message: 'User not found.' });
    }
    // Debug: log user object
    console.log('Fetched user:', user);
    // Get projects assigned to user, including status 
    const projects = await Project.findAll({attributes: ['id', 'name', 'assigned_users', 'status']});
    const userProjects = projects.filter(p => p.assigned_users && p.assigned_users.split(',').map(id => id.trim()).includes(String(userId)));
    // Debug: log userProjects and their status
    console.log('User projects:', userProjects.map(p => ({id: p.id, name: p.name, status: p.status})));
    // Project stats for assigned projects only
    const totalProjects = userProjects.length;
    const totalActive = userProjects.filter(p => p.status && p.status.toLowerCase() === 'active').length;
    const totalNotStarted = userProjects.filter(p => p.status && p.status.toLowerCase() === 'not started').length;
    const totalDone = userProjects.filter(p => p.status && p.status.toLowerCase() === 'done').length;
    // Get task count
    const taskCount = await Task.count({ where: { assigned_to: userId } });
    // Get next upcoming task
    const nextTask = await Task.findOne({ where: { assigned_to: userId }, order: [['due_date', 'ASC']] });
    res.json({
      username: user.username,
      role: user.role,
      projects: userProjects,
      totalProjects,
      totalActive,
      totalNotStarted,
      totalDone,
      taskCount,
      nextTask
    });
  } catch (err) {
    console.error('API /api/home error:', err);
    res.status(500).json({ message: 'Database error.' });
  }
});

/* GET home page. */
router.get(['/', '/home'], authMiddleware, isLogin, function(req, res) {
  res.sendFile('home.html', { root: 'views' });
});

// GET /login route - redirect to login.html
router.get('/login', function(req, res) {
  res.sendFile('login.html', { root: 'views' });
});

router.get('/nologin', function(req, res) {
  res.sendFile('nologin.html', { root: 'views' });
});

module.exports = router;
