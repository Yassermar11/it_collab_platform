const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const sequelize = require('../config/db');

// Load models
const modelFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));

// Initialize models object
const models = {};

// Initialize models
for (const file of modelFiles) {
    const model = require(path.join(__dirname, file));
    const modelName = model.name;
    
    // Initialize all models with sequelize
    models[modelName] = model(sequelize);
}

// Associate models if they have associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Add models to Sequelize instance
sequelize.models = models;

// Export models and Sequelize instance
module.exports = {
    ...models,
    sequelize,
    Op: Sequelize.Op,
    Sequelize
};
