// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const { getStaffList } = require('../controllers/users.controller');

// All routes require authentication
router.use(auth);

// Get staff list (Staff/Admin only - needed for ticket assignment)
router.get('/staff', requireRole([2, 3]), getStaffList);

module.exports = router;

