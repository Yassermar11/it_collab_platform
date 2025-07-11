module.exports = (req, res, next) => {
  if (req.user && req.user.id) {
    return next();
  }
  return res.status(401).json({ message: 'Authentication required.' });
};
