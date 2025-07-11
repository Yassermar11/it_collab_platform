const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];
  if (!token && req.cookies) {
    token = req.cookies.token;
  }
  if (!token) {
    // If request is from browser, redirect to login page
    if (req.accepts('html')) {
      return res.redirect('/nologin');
    }
    // Otherwise, send JSON error
    return res.status(401).json({ message: 'No token provided.' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token.' });
    req.user = user;
    next();
  });
};
