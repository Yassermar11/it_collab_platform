const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { Op } = require('sequelize');
const { Meeting, User } = require('../models');

// Get all meetings for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const meetings = await Meeting.findAll({
            where: {
                [Op.or]: [
                    { creator_id: req.user.id },
                    { invited_users: { [Op.like]: `%${req.user.id}%` } }
                ]
            },
            order: [['start_time', 'ASC']]
        });

        // Parse the invited_users JSON string and add creator username
        const formattedMeetings = meetings.map(meeting => {
            const meetingData = meeting.toJSON();
            return {
                ...meetingData,
                invited_users: meetingData.invited_users ? JSON.parse(meetingData.invited_users) : [],
                creator: {
                    id: meetingData.creator_id,
                    username: meetingData.creator_id === req.user.id ? req.user.username : null
                },
                status: meetingData.computed_status
            };
        });

        res.json(formattedMeetings);
    } catch (error) {
        console.error('Error fetching meetings:', error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

// Get a specific meeting by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const meeting = await Meeting.findByPk(req.params.id);
        
        if (!meeting) {
            console.log(`Meeting with ID ${req.params.id} not found`);
            return res.status(404).json({ 
                error: 'Meeting not found',
                details: `No meeting found with ID ${req.params.id}`
            });
        }

        // Check if user is authorized to view this meeting
        const meetingData = meeting.toJSON();
        const isAuthorized = 
            meetingData.creator_id === req.user.id ||
            (meetingData.invited_users && meetingData.invited_users.includes(req.user.id));

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to view this meeting' });
        }

        // Parse the invited_users JSON string and add creator username
        const formattedMeeting = {
            ...meetingData,
            invited_users: meetingData.invited_users ? JSON.parse(meetingData.invited_users) : [],
            creator: {
                id: meetingData.creator_id,
                username: meetingData.creator_id === req.user.id ? req.user.username : null
            }
        };

        res.json(formattedMeeting);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

module.exports = router;
