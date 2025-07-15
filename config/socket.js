const { ChatRoom, Message, ChatRoomParticipants } = require('../models/Chat');
const { User } = require('../models/index');
const { Op } = require('sequelize');

module.exports = function(io) {
  io.on('connection', async (socket) => {

// Store active connections
const activeConnections = new Map();

io.on('connection', async (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user authentication
  socket.on('auth', async (userId) => {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        socket.emit('error', 'User not found');
        return;
      }

      activeConnections.set(socket.id, userId);
      
      // Update user's online status
      await ChatRoomParticipants.update(
        { isOnline: true },
        { where: { userId } }
      );

      // Join all their chat rooms
      const rooms = await ChatRoomParticipants.findAll({
        where: { userId },
        include: ChatRoom
      });

      rooms.forEach(room => {
        socket.join(room.ChatRoom.id.toString());
      });

      // Notify other users about online status
      io.emit('user-status-change', {
        userId,
        status: 'online'
      });

      socket.emit('auth-success');
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Handle new message
  socket.on('new-message', async (data) => {
    try {
      const { content, chatRoomId, attachment } = data;
      const sender_id = activeConnections.get(socket.id);

      const message = await Message.create({
        content,
        sender_id,
        chatRoomId,
        attachment
      });

      // Broadcast to all users in the chat room
      io.to(chatRoomId.toString()).emit('new-message', {
        ...message.toJSON(),
        sender: await User.findByPk(sender_id)
      });
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Handle read receipts
  socket.on('mark-as-read', async (messageId) => {
    try {
      await Message.update(
        { isRead: true },
        { where: { id: messageId } }
      );
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Handle private chat requests
  socket.on('request-private-chat', async (userId) => {
    try {
      const sender_id = activeConnections.get(socket.id);
      
      // Check if chat room already exists
      const existingRoom = await ChatRoom.findOne({
        where: {
          type: 'private',
          isGroup: false,
          ChatRoomParticipants: {
            userId: { [Op.in]: [sender_id, userId] }
          }
        },
        include: ChatRoomParticipants
      });

      if (existingRoom) {
        socket.emit('private-chat-room', existingRoom);
        return;
      }

      // Create new chat room
      const chatRoom = await ChatRoom.create({
        name: `Private chat between ${sender_id} and ${userId}`,
        type: 'private'
      });

      // Add both users to the chat room
      await Promise.all([
        ChatRoomParticipants.create({
          chatRoomId: chatRoom.id,
          userId: sender_id
        }),
        ChatRoomParticipants.create({
          chatRoomId: chatRoom.id,
          userId: userId
        })
      ]);

      socket.emit('private-chat-room', chatRoom);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    const userId = activeConnections.get(socket.id);
    if (userId) {
      activeConnections.delete(socket.id);
      
      // Update user's online status
      await ChatRoomParticipants.update(
        { isOnline: false },
        { where: { userId } }
      );

      // Notify other users about offline status
      io.emit('user-status-change', {
        userId,
        status: 'offline'
      });
    }
  });
    });
  });
};
