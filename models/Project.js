const { DataTypes } = require('sequelize');

const Project = (sequelize) => {
    const ProjectModel = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        status: {
            type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
            defaultValue: 'pending'
        },
        assigned_users: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });

    ProjectModel.associate = (models) => {
        // Define associations here if needed
    };

    return ProjectModel;
};

module.exports = Project;
