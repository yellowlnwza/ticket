// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const { 
  getStaffList, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  toggleUserStatus
} = require('../controllers/users.controller');

// All routes require authentication
router.use(auth);

// Get staff list (Staff/Admin only - needed for ticket assignment)
router.get('/staff', requireRole([2, 3]), getStaffList);

// User management routes (Admin only)
router.get('/', requireRole([3]), getAllUsers);
router.post('/', requireRole([3]), createUser);
router.put('/:id', requireRole([3]), updateUser);
router.put('/:id/status', requireRole([3]), toggleUserStatus);
router.delete('/:id', requireRole([3]), deleteUser);

module.exports = router;

