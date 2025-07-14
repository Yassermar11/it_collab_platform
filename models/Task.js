const { DataTypes } = require('sequelize');

const Task = (sequelize) => {
    const TaskModel = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'pending',
            comment: 'Task status: pending, in_progress, or completed'
        },
        due_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        assigned_to: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'projects',
                key: 'id'
            }
        }
    }, {
        tableName: 'tasks',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at'
    });

    TaskModel.associate = (models) => {
        TaskModel.belongsTo(models.User, {
            foreignKey: 'assigned_to',
            as: 'assignee'
        });
        
        TaskModel.belongsTo(models.Project, {
            foreignKey: 'project_id',
            as: 'project'
        });
    };

    return TaskModel;
};

module.exports = Task;
