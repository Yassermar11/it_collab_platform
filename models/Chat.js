const { DataTypes } = require('sequelize');

const ChatRoom = (sequelize) => {
    const ChatRoomModel = sequelize.define('ChatRoom', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('private', 'public'),
            allowNull: false,
            defaultValue: 'private'
        },
        isGroup: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        timestamps: true
    });

    ChatRoomModel.name = 'ChatRoom';
    
    // Associations
    ChatRoomModel.associate = (models) => {
        ChatRoomModel.hasMany(models.Message, {
            foreignKey: 'chatRoomId',
            as: 'messages'
        });
        ChatRoomModel.belongsToMany(models.User, {
            through: 'ChatRoomUsers',
            foreignKey: 'chatRoomId',
            otherKey: 'userId',
            as: 'participants'
        });
    };
    
    return ChatRoomModel;
};

module.exports = ChatRoom;
