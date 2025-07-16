const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

// Load models
const modelFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));

// Initialize models object
const models = {};

// Load and initialize models
modelFiles.forEach(file => {
    const model = require(path.join(__dirname, file));
    const modelName = file.replace('.js', '');
    models[modelName] = model(sequelize, Sequelize.DataTypes);
});

// Associate models
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Add models to Sequelize instance
sequelize.models = models;

// Export models
module.exports = models;

// Export models and Sequelize instance
module.exports = {
    ...models,
    sequelize,
    Op: Sequelize.Op,
    Sequelize
};
