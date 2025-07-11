const express = require('express');
require('dotenv').config();
const router = express.Router();
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');

// GET /auth/logout
router.get('/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users',
  timestamps: false,
});

// POST /auth/login
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required.' });
  }
  User.findOne({ where: { email } })
    .then(user => {
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
      // Generate JWT token with user info (add role if available)
      const token = jwt.sign({ id: user.id, email: user.email, name: user.username, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '2h' });
      // If browser, set cookie and redirect
      if (req.accepts('html')) {
        res.cookie('token', token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
        return res.redirect('/home');
      }
      // For API, send token and user info in response
      res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role || 'user', created_at: user.created_at } });
    })
    .catch(err => {
      console.error('Login DB error:', err);
      res.status(500).json({ message: 'Database error.', error: err.message });
    });
});

module.exports = router;
