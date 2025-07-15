const { DataTypes } = require('sequelize');

const User = (sequelize) => {
    const UserModel = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'users',
        timestamps: false
    });

    UserModel.name = 'User';
    
    // Associations
    UserModel.associate = (models) => {
        UserModel.hasMany(models.Message, {
            foreignKey: 'sender_id',
            as: 'sentMessages'
        });
        UserModel.hasMany(models.Message, {
            foreignKey: 'receiver_id',
            as: 'receivedMessages'
        });
    };
    
    return UserModel;
};

module.exports = User;