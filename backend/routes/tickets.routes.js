// backend/routes/tickets.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');

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
  postComment,
  getReport
  // getTicketsForUser
} = require('../controllers/tickets.controller');


//  ต้องล็อกอินก่อนถึงจะใช้งาน API เหล่านี้ได้
router.use(auth);

//  สร้าง Ticket (All authenticated users can create tickets)
router.post('/', createTicket);

//  ดึงสถิติสำหรับ dashboard (All authenticated users)
router.get('/stats', getStats);

//  ดึงเฉพาะ ticket ของผู้ใช้ที่ล็อกอินอยู่ (All authenticated users)
router.get('/my', getMyTickets);

//  Export tickets (Admin only)
router.get('/export', requireRole([3]), exportTickets);

//  ดึง Ticket ทั้งหมด (หรือกรองตาม user - handled in controller)
router.get('/', getAllTickets);

//  สร้างคอมเมนต์สำหรับ ticket (All authenticated users)
router.post('/:id/comments', postComment);

//  อัปเดตสถานะ Ticket (Staff/Admin only)
router.put('/:id/status', requireRole([2, 3]), updateTicketStatus);

//  มอบหมาย Ticket ให้พนักงาน (Staff/Admin only)
router.put('/:id/assign', requireRole([2, 3]), assignTicket);

//  แก้ไข Ticket (All authenticated users - status update restricted in controller)
router.put('/:id', updateTicket);

//  ลบ Ticket (Admin only, or ticket creator - checked in controller)
router.delete('/:id', deleteTicket);

//  Status stats (Staff/Admin only)
router.get('/status-stats', requireRole([2, 3]), getStatusStats);

//  List by priority (Staff/Admin only)
router.get("/list-by-priority", requireRole([2, 3]), getTicketsByPriority);

//  Monthly stats (Staff/Admin only)
router.get('/monthly-stats', requireRole([2, 3]), getMonthlyStats);

//  Report data (Admin only)
router.get('/report', requireRole([3]), getReport);

//  ดึง Ticket ตาม ID (All authenticated users - access control in controller)
router.get('/:id', getTicketById);

module.exports = router;
