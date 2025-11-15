// backend/routes/users.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { getStaffList } = require('../controllers/users.controller');

// Get staff list (requires authentication)
router.get('/staff', auth, getStaffList);

module.exports = router;

