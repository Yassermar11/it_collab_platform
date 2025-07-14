const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { Op } = require('sequelize');
const auth = require('../middleware/authMiddleware');

// Get all users for chat interface
router.get('/users', auth, async (req, res) => {
    try {
        // Make sure we have a logged-in user
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        // Get all users except the current user
        const users = await User.findAll({
            where: { id: { [Op.ne]: req.user.id } },
            attributes: ['id', 'username']
        });
        
        // Log the result for debugging
        console.log('Found users:', users);
        
        // Ensure we have users before sending response
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Send a message
router.post('/message', auth, async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        
        if (!receiverId || !content) {
            return res.status(400).json({ error: 'Receiver ID and content are required' });
        }

        const message = await Message.create({
            content,
            senderId: req.user.id,
            receiverId
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages between two users
router.get('/messages/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { 
                        senderId: req.user.id, 
                        receiverId: userId 
                    },
                    { 
                        senderId: userId, 
                        receiverId: req.user.id 
                    }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                }
            ],
            order: [['created_at', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all chat rooms and users for current user
router.get('/rooms', auth, async (req, res) => {
    try {
        const user = req.user;
        
        // Get all chat rooms the user is part of
        const chatRooms = await ChatRoomParticipants.findAll({
            where: { userId: user.id },
            include: [
                {
                    model: ChatRoom,
                    include: [
                        {
                            model: User,
                            as: 'participants',
                            through: { attributes: [] }
                        }
                    ]
                }
            ]
        });

        // Get all users except current user
        const users = await User.findAll({
            where: { id: { [Op.ne]: user.id } },
            attributes: ['id', 'username']
        });

        res.json({
            chatRooms: chatRooms.map(room => ({
                id: room.ChatRoom.id,
                name: room.ChatRoom.name,
                type: room.ChatRoom.type,
                participants: room.ChatRoom.participants.map(p => ({
                    id: p.id,
                    username: p.username
                }))
            })),
            users
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a specific chat room
router.get('/messages/:roomId', auth, async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await Message.findAll({
            where: { chatRoomId: roomId },
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['id', 'username']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new chat room
router.post('/room', auth, async (req, res) => {
    try {
        const { userId } = req.body;
        const user = req.user;

        // Create new chat room
        const chatRoom = await ChatRoom.create({
            name: `Private chat between ${user.id} and ${userId}`,
            type: 'private'
        });

        // Add both users to the chat room
        await Promise.all([
            ChatRoomParticipants.create({
                chatRoomId: chatRoom.id,
                userId: user.id
            }),
            ChatRoomParticipants.create({
                chatRoomId: chatRoom.id,
                userId
            })
        ]);

        res.json(chatRoom);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark messages as read
router.post('/messages/:messageId/read', auth, async (req, res) => {
    try {
        const { messageId } = req.params;
        await Message.update(
            { isRead: true },
            { where: { id: messageId } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
