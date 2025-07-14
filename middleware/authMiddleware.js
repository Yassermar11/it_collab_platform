const { User } = require('../models');

module.exports = async (req, res, next) => {
  // Check if this is an API request
  const isApiRequest = req.path.startsWith('/api/');
  
  if (!req.session.userId) {
    if (isApiRequest) {
      return res.status(401).json({ message: 'Not authenticated' });
    } else {
      return res.redirect('/login');
    }
  }

  try {
    const user = await User.findByPk(req.session.userId);
    if (!user) {
      if (isApiRequest) {
        return res.status(401).json({ message: 'User not found' });
      } else {
        // Clear invalid session and redirect to login
        req.session.destroy(() => {
          res.redirect('/login');
        });
        return;
      }
    }
    
    // Ensure user object is properly formatted
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (err) {
    console.error('Error finding user:', err);
    if (isApiRequest) {
      return res.status(500).json({ 
        message: 'Internal server error',
        error: err.message
      });
    } else {
      // Clear session on error and redirect to login
      req.session.destroy(() => {
        res.redirect('/login');
      });
    }
  }
};
