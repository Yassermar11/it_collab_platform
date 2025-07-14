const { DataTypes } = require('sequelize');

const Message = (sequelize) => {
    const MessageModel = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'messages',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    MessageModel.associate = (models) => {
        MessageModel.belongsTo(models.User, {
            foreignKey: 'sender_id',
            as: 'sender'
        });
        MessageModel.belongsTo(models.User, {
            foreignKey: 'receiver_id',
            as: 'receiver'
        });
    };

    return MessageModel;
};

module.exports = Message;
