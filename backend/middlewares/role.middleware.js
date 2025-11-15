module.exports = (allowedRoles=[]) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'No user' });
    // allowedRoles as array of role names or role_ids depending on implementation.
    // If allowedRoles contains role names, map role_id -> name first.
    const userRoleId = req.user.role_id;
    // assume allowedRoles are role_ids for simplicity:
    if (!allowedRoles.includes(userRoleId)) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
};
