// backend/routes/tickets.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const { 
  createTicket, 
  getAllTickets, 
  getTicketById, 
  getMyTickets,
  getStats,
  updateTicketStatus, 
  assignTicket,
  updateTicket,
  deleteTicket, 
  exportTickets,
  getStatusStats,
  getMonthlyStats,
  getTicketsByPriority,
  postComment
  // getTicketsForUser
} = require('../controllers/tickets.controller');


// ✅ ต้องล็อกอินก่อนถึงจะใช้งาน API เหล่านี้ได้
router.use(auth);

// ✅ สร้าง Ticket
router.post('/',auth, upload.single('attachment'), createTicket);

// ✅ ดึงสถิติสำหรับ dashboard
router.get('/stats', auth, getStats);

// ✅ ดึงเฉพาะ ticket ของผู้ใช้ที่ล็อกอินอยู่
router.get('/my', auth, getMyTickets);

router.get('/export', auth, exportTickets);
// router.get('/assigned', auth, getTicketsForUser); 

// ✅ ดึง Ticket ทั้งหมด (หรือกรองตาม user)
router.get('/', getAllTickets);

// ✅ สร้างคอมเมนต์สำหรับ ticket
router.post('/:id/comments', postComment);

// ✅ อัปเดตสถานะ Ticket
router.put('/:id/status', updateTicketStatus);

// ✅ มอบหมาย Ticket ให้พนักงาน
router.put('/:id/assign', assignTicket);

// แก้ไข Ticket (เฉพาะผู้สร้างหรือแอดมิน)
router.put('/:id', updateTicket);

// ✅ ลบ Ticket (เฉพาะ admin)
router.delete('/:id', deleteTicket);

// แนะนำให้ route พิเศษอยู่ก่อน /:id
router.get('/status-stats', auth, getStatusStats);

router.get("/list-by-priority", auth, getTicketsByPriority);

// ดึงสถิติสำหรับแผงควบคุม
router.get('/monthly-stats', auth, getMonthlyStats);

// ✅ ดึง Ticket ตาม ID (ต้องอยู่หลังเส้นทางพิเศษทั้งหมด)
router.get('/:id', getTicketById);

module.exports = router;
