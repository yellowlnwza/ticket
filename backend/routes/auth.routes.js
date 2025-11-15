// backend/routes/auth.routes.js
const express = require('express');
const router = express.Router();

const { login, register } = require('../controllers/auth.controller');

// เส้นทางเข้าสู่ระบบ
router.post('/login', login);

// เส้นทางสมัครสมาชิก (ถ้าเปิดให้สมัคร)
router.post('/register', register);

module.exports = router;
