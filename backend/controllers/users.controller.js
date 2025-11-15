// backend/controllers/users.controller.js
const { User } = require('../models');

// Get list of staff members (role_id = 2)
exports.getStaffList = async (req, res) => {
  try {
    const staff = await User.findAll({
      where: { role_id: 2 }, // Staff role
      attributes: ['user_id', 'name', 'email'],
      order: [['name', 'ASC']]
    });

    res.json({ 
      success: true, 
      staff: staff.map(s => ({
        id: s.user_id,
        user_id: s.user_id,
        name: s.name,
        email: s.email
      }))
    });
  } catch (err) {
    console.error('Error fetching staff list:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

