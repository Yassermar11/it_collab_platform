const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define Session model
const Session = sequelize.define('Session', {
    sid: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    expires: {
        type: DataTypes.DATE
    },
    data: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'sessions',
    timestamps: false
});

// Initialize the session store
const sessionStore = new SequelizeStore({
    db: sequelize,
    table: 'sessions'
});

// Create the sessions table if it doesn't exist
sessionStore.sync({
    force: false
});

module.exports = session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
});
