// Role-based access control middleware
module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: No user found' });
    }

    const userRoleId = req.user.role_id;
    
    if (!allowedRoles.includes(userRoleId)) {
      return res.status(403).json({ 
        success: false,
        message: 'Forbidden: Insufficient permissions' 
      });
    }

    next();
  };
};

// Usage: requireRole([2, 3]) - allows Staff (2) and Admin (3)
//        requireRole([3]) - allows only Admin (3)
//        requireRole([1, 2, 3]) - allows all roles
module.exports.requireAdmin = () => module.exports([3]);
module.exports.requireStaff = () => module.exports([2, 3]);
module.exports.requireStaffOrAdmin = () => module.exports([2, 3]);
module.exports.requireUser = () => module.exports([1, 2, 3]); // All authenticated users
