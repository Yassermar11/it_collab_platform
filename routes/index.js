const express = require('express');
const router = express.Router();
const { Project, Message, Op, User, Task, Sequelize } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');
const isLogin = require('../middleware/isLogin');


// Root route
router.get('/', (req, res) => {
    res.sendFile('home.html', { root: 'views' });
});

// GET /api/home - fetch user's home data
router.get('/api/home', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        
        // Get user's information
        const userData = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        // Get user's projects
        const projects = await Project.findAll({
            where: {
                assigned_users: {
                    [Op.like]: `%${user.id}%`
                }
            },
            attributes: ['id', 'name', 'description', 'status', 'created_at', 'created_at']
        });

        // Get user's recent messages
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { sender_id: user.id },
                    { receiver_id: user.id }
                ]
            },
            order: [['created_at', 'DESC']],
            limit: 10,
            attributes: ['id', 'content', 'sender_id', 'receiver_id', 'is_read', 'created_at'],
            include: [
                { model: User, as: 'sender', attributes: ['username'] },
                { model: User, as: 'receiver', attributes: ['username'] }
            ]
        }).catch(err => {
            console.error('Error fetching messages:', err);
            return [];
        });

        // Get user's tasks
        const tasks = await Task.findAll({
            where: {
                assigned_to: user.id
            },
            attributes: ['id', 'name', 'status', 'due_date', 'created_at']
        });

        // Calculate task statistics
        const taskStats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            in_progress: tasks.filter(t => t.status === 'in_progress').length,
            completed: tasks.filter(t => t.status === 'completed').length
        };

        // Update project stats
        if (projects && projects.length > 0) {
            // Convert status to lowercase for case-insensitive comparison
            const projectStats = projects.map(p => ({
                ...p,
                status: p.status.toLowerCase()
            }));

            const activeProjects = projectStats.filter(p => p.status === 'active').length;
            const totalProjects = projectStats.length;
            const notStartedProjects = projectStats.filter(p => p.status === 'not started').length;
            const doneProjects = projectStats.filter(p => p.status === 'done').length;

            res.json({
                user: userData,
                projects: {
                    active: activeProjects,
                    total: totalProjects,
                    notStarted: notStartedProjects,
                    done: doneProjects
                },
                messages,
                tasks: taskStats
            });
        } else {
            res.json({
                user: userData,
                projects: {},
                messages,
                tasks: taskStats
            });
        }
    } catch (err) {
        console.error('API /api/home error:', err);
        res.status(500).json({ message: 'Database error.' });
    }
});

// GET /api/projects - fetch projects assigned to logged-in user
router.get('/api/projects', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // Get all projects
    const projects = await Project.findAll({ attributes: ['id', 'name', 'description', 'status', 'assigned_users', 'created_at'] });
    // Filter projects where userId is in assigned_users CSV
    const userProjects = projects.filter(p => {
      if (!p.assigned_users) return false;
      return p.assigned_users.split(',').map(id => id.trim()).includes(String(userId));
    });
    res.json(userProjects);
  } catch (err) {
    console.error('API /api/projects error:', err);
    res.status(500).json({ message: 'Database error.' });
  }
});

// GET /api/projects/:id - fetch project details
router.get('/api/projects/:id', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  const projectId = req.params.id;
  try {
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    // Check if user is assigned
    if (!project.assigned_users || !project.assigned_users.split(',').map(id => id.trim()).includes(String(userId))) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    // Get assigned user details
    let assignedUserIds = project.assigned_users.split(',').map(id => id.trim());
    const assignedUsers = await User.findAll({ where: { id: assignedUserIds }, attributes: ['id', 'username', 'role'] });
    // Return project details with assigned users
    res.json({
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      created_at: project.created_at,
      assigned_users: assignedUsers
    });
  } catch (err) {
    console.error('API /api/projects/:id error:', err);
    res.status(500).json({ message: 'Database error.' });
  }
});

// GET /api/tasks - get user's tasks
router.get('/api/tasks', async (req, res) => {
  console.log('Request headers:', req.headers);
  
  // Check if user is authenticated
  if (!req.session || !req.session.userId) {
    console.error('No user session found');
    return res.status(401).json({ 
      message: 'Not authenticated',
      requiresLogin: true
    });
  }
  
  const userId = req.session.userId;

  console.log(`Fetching tasks for user ID: ${userId}`);
  
  try {
    // First, verify the user exists
    const user = await User.findByPk(userId);
    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Then fetch tasks with error handling
    const tasks = await Task.findAll({
      where: { assigned_to: userId },
      attributes: [
        'id', 
        'name', 
        'description', 
        'due_date', 
        'status', 
        'project_id'
      ],
      raw: true // Get plain objects instead of model instances
    });

    console.log(`Found ${tasks.length} tasks for user ${userId}`);
    
    // Format tasks for the frontend
    const formattedTasks = tasks.map(task => {
      // Debug log for each task
      console.log('Processing task:', task);
      
      return {
        id: task.id,
        title: task.name || 'Sans titre',
        description: task.description || '',
        dueDate: task.due_date ? new Date(task.due_date).toISOString() : null,
        status: task.status === 'in_progress' ? 'inprogress' : (task.status || 'pending'),
        projectId: task.project_id
      };
    });
    
    res.json(formattedTasks);
  } catch (err) {
    console.error('API /api/tasks error:', {
      message: err.message,
      stack: err.stack,
      userId: userId,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      message: 'Error fetching tasks',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/home - get user's dashboard data
router.get('/api/home', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    // Get user info
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Get projects assigned to user
    const projects = await Project.findAll({
      attributes: ['id', 'name', 'assigned_users', 'status']
    });
    const userProjects = projects.filter(p => 
      p.assigned_users && 
      p.assigned_users.split(',').map(id => id.trim()).includes(String(userId))
    );
    
    // Get tasks assigned to user
    const userTasks = await Task.findAll({
      where: { assigned_to: userId },
      attributes: ['id', 'name', 'due_date', 'status']
    });
    
    // Get next upcoming task (simplified query)
    const nextTask = await Task.findOne({ 
      where: { 
        assigned_to: userId,
        status: ['pending', 'in_progress']
      },
      order: [['due_date', 'ASC']],
      attributes: ['id', 'name', 'due_date']
    });

    res.json({
      username: user.username,
      role: user.role,
      projects: userProjects,
      totalProjects: userProjects.length,
      tasks: userTasks,
      totalTasks: userTasks.length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      completed: userTasks.filter(t => t.status === 'completed').length,
      nextTask: nextTask || null
    });
    
  } catch (err) {
    console.error('API /api/home error:', err);
    res.status(500).json({ message: 'Database error.' });
  }
});

// GET /api/tasks - Fetch all tasks for current user
router.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { assigned_to: req.user.id },
      order: [['due_date', 'ASC']],
      attributes: ['id', 'name', 'description', 'due_date', 'status']
    });
    
    res.json(tasks.map(task => ({
      id: task.id,
      title: task.name,
      description: task.description,
      dueDate: task.due_date,
      status: task.status
    })));
    
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PUT /api/tasks/:id/complete - Mark task as complete
router.put('/api/tasks/:id/complete', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { 
        id: req.params.id, 
        assigned_to: req.user.id 
      }
    });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or not assigned to you' });
    }
    
    await task.update({ 
      status: 'completed',
      // You might want to add a completed_at timestamp
      // completed_at: new Date()
    });
    
    res.json({
      message: 'Task marked as complete',
      task: {
        id: task.id,
        title: task.name,
        status: 'completed'
      }
    });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});
  
/* GET home page. */
router.get(['/', '/home'], authMiddleware, isLogin, function(req, res) {
  res.sendFile('home.html', { root: 'views' });
});


// GET /projects route - serve projects.html
router.get('/projects', authMiddleware, isLogin, function(req, res) {
  res.sendFile('projects.html', { root: 'views' });
});

// GET /calendar route - serve calendar.html
router.get('/calendar', authMiddleware, isLogin, function(req, res) {
  res.sendFile('calendar.html', { root: 'views' });
});

// GET /login route - redirect to login.html
router.get('/login', function(req, res) {
  res.sendFile('login.html', { root: 'views' });
});

router.get('/test', function(req, res) {
  res.sendFile('al.html', { root: 'views' });
});

router.get('/tasks', function(req, res) {
  res.sendFile('tasks.html', { root: 'views' });
});

// GET /calendar route - serve calendar.html
router.get('/calendar', authMiddleware, isLogin, function(req, res) {
  res.sendFile('calendar.html', { root: 'views' });
});

router.get('/nologin', function(req, res) {
  res.sendFile('nologin.html', { root: 'views' });
});

router.get('/chat', function(req, res) {
  res.sendFile('chat.html', { root: 'views' });
});

router.get('/meeting', function(req, res) {
  res.sendFile('meetings.html', { root: 'views' });
});

module.exports = router;
