const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const { Notification } = require('../models');

// All routes require authentication
router.use(auth);

// ✅ ดึง notification ของ user ที่ยังไม่อ่าน (All authenticated users)
router.get('/my', async (req, res) => {
  const notifications = await Notification.findAll({
    where: { user_id: req.user.user_id, is_read: false },
    order: [['createdAt', 'DESC']],
  });
  res.json(notifications);
});

// ✅ อัปเดตสถานะว่าอ่านแล้ว (All authenticated users - can only mark their own as read)
router.put('/:id/read', async (req, res) => {
  const notif = await Notification.findByPk(req.params.id);
  if (notif && notif.user_id === req.user.user_id) {
    notif.is_read = true;
    await notif.save();
  }
  res.json({ success: true });
});

module.exports = router;
