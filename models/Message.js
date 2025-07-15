const { DataTypes } = require('sequelize');

const Message = (sequelize) => {
    const MessageModel = sequelize.define('Message', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'id'
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'content'
        },
        sender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'sender_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        receiver_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'receiver_id',
            references: {
                model: 'users',
                key: 'id'
            }
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_read'
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
            as: 'sender',
            constraints: false
        });
        MessageModel.belongsTo(models.User, {
            foreignKey: 'receiver_id',
            as: 'receiver',
            constraints: false
        });
    };

    return MessageModel;
};

module.exports = Message;
