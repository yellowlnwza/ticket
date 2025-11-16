const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

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

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, attributes: ['role_name'] }],
      order: [['user_id', 'DESC']]
    });

    // Map role_id to role name
    const roleMap = {
      1: 'End User',
      2: 'Support Staff',
      3: 'Administrator'
    };

    const formattedUsers = users.map(user => {
      const plain = user.get({ plain: true });
      return {
        id: plain.user_id,
        user_id: plain.user_id,
        name: plain.name,
        email: plain.email,
        role: roleMap[plain.role_id] || 'Unknown',
        role_id: plain.role_id,
        status: plain.status || 'Active',
        created_at: plain.created_at || new Date().toISOString()
      };
    });

    res.json({ success: true, users: formattedUsers });
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Map role name to role_id
    const roleMap = {
      'End User': 1,
      'Support Staff': 2,
      'Administrator': 3
    };

    const role_id = roleMap[role] || 1; // Default to End User

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password_hash,
      role_id
    });

    // Get role name
    const roleNameMap = {
      1: 'End User',
      2: 'Support Staff',
      3: 'Administrator'
    };

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user_id,
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: roleNameMap[newUser.role_id] || 'Unknown',
        role_id: newUser.role_id,
        status: newUser.status || 'Active',
        created_at: newUser.created_at || new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existing = await User.findOne({ where: { email } });
      if (existing && existing.user_id !== parseInt(id)) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email;
    }
    if (role) {
      const roleMap = {
        'End User': 1,
        'Support Staff': 2,
        'Administrator': 3
      };
      user.role_id = roleMap[role] || user.role_id;
    }
    if (password) {
      user.password_hash = await bcrypt.hash(password, 10);
    }

    await user.save();

    const roleNameMap = {
      1: 'End User',
      2: 'Support Staff',
      3: 'Administrator'
    };

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user.user_id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: roleNameMap[user.role_id] || 'Unknown',
        role_id: user.role_id,
        status: user.status || 'Active',
        created_at: user.created_at || new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.destroy({ where: { user_id: id } });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle user status (Block/Unblock) (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent blocking yourself
    if (parseInt(id) === req.user.user_id) {
      return res.status(400).json({ message: 'Cannot block your own account' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Toggle status
    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    await user.save();

    const roleNameMap = {
      1: 'End User',
      2: 'Support Staff',
      3: 'Administrator'
    };

    res.json({
      success: true,
      message: `User ${user.status === 'Active' ? 'activated' : 'suspended'} successfully`,
      user: {
        id: user.user_id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: roleNameMap[user.role_id] || 'Unknown',
        role_id: user.role_id,
        status: user.status,
        created_at: user.created_at || new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Error toggling user status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

