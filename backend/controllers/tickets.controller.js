// backend/controllers/tickets.controller.js
const { Ticket, User, Comment, Notification } = require('../models');
const { Sequelize, Op } = require('sequelize'); // ✅ เพิ่ม Op สำหรับ array filter
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// สร้าง Ticket ใหม่
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status: "Open",
      user_id: req.user.user_id,
      due_date: due_date || null,
    });

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ดึง Ticket ทั้งหมด (Admin / Staff เห็นทั้งหมด, User เห็นเฉพาะตัวเอง)
exports.getAllTickets = async (req, res) => {
  try {
    const where = {};
    if (req.user.role_id === 1) where.user_id = req.user.user_id;

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: User, as: 'creator' },
        { model: User, as: 'assignee' }
      ],
      order: [['created_at', 'DESC']],
    });

    const plain = tickets.map(t => {
      const p = t.get({ plain: true });
      return {
        id: p.ticket_id,
        title: p.title,
        description: p.description,
        status: p.status,
        priority: p.priority,
        assigned_to: p.assigned_to,
        assignee: p.assignee ? { id: p.assignee.user_id, name: p.assignee.name } : null,
        due_date: p.due_date,
        creator: p.creator ? { id: p.creator.user_id, name: p.creator.name } : null,
        created_at: p.created_at,
        updated_at: p.updated_at
      };
    });

    res.json(plain);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดึง Ticket ตาม ID
exports.getTicketById = async (req, res) => {
  try {
    const ticketInstance = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [{ model: User }] },
        { model: User, as: 'creator' }
      ]
    });

    if (!ticketInstance) return res.status(404).json({ message: 'Ticket not found' });

    const ticket = ticketInstance.get({ plain: true }); // แปลงเป็น object ปกติ
    const formatted = {
      id: ticket.ticket_id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      assigned_to: ticket.assigned_to,
      due_date: ticket.due_date,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      creator: ticket.creator || null,
      comments: (ticket.Comments || []).map(c => ({
        id: c.comment_id,
        author: c.User ? c.User.name : 'Unknown',
        text: c.content,
        created_at: c.created_at
      }))
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /tickets/:id/comments
exports.postComment = async (req, res) => {
  try {
    console.log('POST /tickets/:id/comments - req.user=', req.user, 'body=', req.body);
    const ticketId = req.params.id;
    const { text } = req.body;

    const ticket = await Ticket.findByPk(ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const comment = await Comment.create({
      ticket_id: ticketId,
      user_id: req.user.user_id,
      content: text
    });

    const saved = await Comment.findByPk(comment.comment_id, { include: [{ model: User }] });
    const plain = saved.get({ plain: true });

    res.status(201).json({
      success: true,
      comment: {
        id: plain.comment_id,
        author: plain.User ? plain.User.name : 'Unknown',
        text: plain.content,
        created_at: plain.created_at
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /tickets/stats
exports.getStats = async (req, res) => {
  try {
    const total = await Ticket.count();

    const open = await Ticket.count({
      where: { status: ['Open', 'open', 'Pending'] }
    });

    const inProgress = await Ticket.count({
      where: { status: ['In Progress', 'in progress'] }
    });

    const resolved = await Ticket.count({
      where: { status: ['Resolved', 'resolved'] }
    });

    const closed = await Ticket.count({
      where: { status: ['Closed', 'closed'] }
    });

    // ลบ overdue ออกไป เพราะยังไม่มี due_date
    res.json({ total, open, inProgress, resolved, closed });
  } catch (err) {
    console.error('Error in getStats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /tickets/my
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const total = await Ticket.count({ where: { user_id: userId } });

    const open = await Ticket.count({ 
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['Open','open','Pending'] } 
      } 
    });

    const inProgress = await Ticket.count({ 
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['In Progress','in progress'] } 
      } 
    });

    const resolved = await Ticket.count({ 
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['Resolved','resolved'] } 
      } 
    });

    const closed = await Ticket.count({ 
      where: { 
        user_id: userId, 
        status: { [Op.in]: ['Closed','closed'] } 
      } 
    });

    res.status(200).json({ total, open, inProgress, resolved, closed });
  } catch (err) {
    console.error('Error in getMyTickets:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// อัปเดตสถานะ Ticket (เฉพาะ Staff/Admin)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const roleId = req.user.role_id;

    // ✅ ให้เฉพาะ Staff (2) หรือ Admin (3) เท่านั้นที่อัปเดตได้
    if (roleId === 1) {
      return res.status(403).json({ success: false, message: 'Access denied: only staff or admin can update ticket status.' });
    }

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    ticket.status = status;
    await ticket.save();

    // ✅ แจ้งเตือนเจ้าของ ticket
    await Notification.create({
      message: `สถานะของ Ticket #${id} ถูกเปลี่ยนเป็น "${status}"`,
      user_id: ticket.user_id,
    });

    res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Assign Ticket (Admin/Staff)
exports.assignTicket = async (req, res) => {
  try {
    const { assigned_to } = req.body;
    const { id } = req.params;
    const roleId = req.user.role_id;
    const userId = req.user.user_id;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (roleId === 3) {
      const staff = await User.findByPk(assigned_to);
      if (!staff) return res.status(404).json({ message: 'Staff not found' });
      ticket.assigned_to = assigned_to;
    } else if (roleId === 2) {
      if (parseInt(assigned_to) !== userId) {
        return res.status(403).json({ success: false, message: 'Staff can only assign ticket to themselves' });
      }
      ticket.assigned_to = userId;
    } else {
      return res.status(403).json({ success: false, message: 'Access denied: only staff or admin can assign tickets.' });
    }

    // เปลี่ยน status เป็น "In Progress" เฉพาะเมื่อ ticket ยังเป็น "Open" อยู่
    // ถ้า ticket เป็น status อื่นแล้ว (เช่น Resolved, Closed) ไม่ต้องเปลี่ยน
    if (ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }
    ticket.updated_at = new Date();
    await ticket.save();

    res.json({ success: true, message: 'Ticket assigned successfully.', ticket });
  } catch (err) {
    console.error('Error assigning ticket:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// backend/controllers/tickets.controller.js
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // อัปเดตข้อมูลที่ทุกคนแก้ได้
    ticket.title = title;
    ticket.description = description;
    ticket.priority = priority;

    // อัปเดต status เฉพาะ staff/admin
    if (req.user.role_id === 2 || req.user.role_id === 3) {
      ticket.status = status;
    }

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ลบ Ticket (เฉพาะเจ้าของ ticket หรือ Admin)
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const roleId = req.user.role_id;

    // หา ticket ก่อน
    const ticket = await Ticket.findByPk(id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // เช็คว่า user เป็นเจ้าของ ticket หรือเป็น Admin (role_id = 3)
    if (ticket.user_id !== userId && roleId !== 3) {
      return res.status(403).json({ 
        success: false, 
        message: "You can only delete tickets that you created" 
      });
    }

    // ลบ ticket
    await Ticket.destroy({
      where: { ticket_id: id }
    });

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error) {
    console.error("Delete Ticket Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// สถิติสำหรับ Dashboard
// ดึงจำนวน Ticket แยกตามเดือน
exports.getMonthlyStats = async (req, res) => {
  try {
    const stats = await Ticket.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('ticket_id')), 'count']
      ],
      group: ['month'],
      order: [[Sequelize.fn('MONTH', Sequelize.col('created_at')), 'ASC']]
    });

    // แปลงรูปแบบให้ labels + data
    const formatted = {
      labels: stats.map(s => `เดือน ${s.get('month')}`),
      data: stats.map(s => s.get('count'))
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// backend/controllers/tickets.controller.js
exports.getStatusStats = async (req, res) => {
  try {
    const open = await Ticket.count({ where: { status: { [Op.in]: ['Open','open','Pending'] } } });
    const inProgress = await Ticket.count({ where: { status: { [Op.in]: ['In Progress','in progress'] } } });
    const resolved = await Ticket.count({ where: { status: { [Op.in]: ['Resolved','resolved'] } } });
    const closed = await Ticket.count({ where: { status: { [Op.in]: ['Closed','closed'] } } });

    res.json({
      labels: ['เปิดอยู่', 'กำลังดำเนินการ', 'แก้ไขแล้ว' , 'ปิดแล้ว'],
      data: [open, inProgress, resolved, closed]
    });
  } catch (err) {
    console.error('Error in getStatusStats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTicketsByPriority = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      attributes: ["ticket_id", "title", "priority", "status", "assigned_to", "created_at", "updated_at"],
      order: [["priority", "DESC"], ["created_at", "DESC"]], // เปลี่ยน createdAt -> created_at
    });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tickets" });
  }
};

exports.exportTickets = async (req, res) => {
  try {
    if (req.user.role_id !== 3) return res.status(403).json({ message: "Access denied" });

    const tickets = await Ticket.findAll({
      include: [{ model: User, as: 'creator', attributes: ['name', 'email'] }],
      raw: true,
      nest: true,
    });

    const format = req.query.format || "csv";

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Tickets");

      // header
      sheet.columns = [
        { header: "ID", key: "ticket_id", width: 10 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 50 },
        { header: "Priority", key: "priority", width: 10 },
        { header: "Status", key: "status", width: 15 },
        { header: "Creator Name", key: "creator_name", width: 20 },
        { header: "Creator Email", key: "creator_email", width: 25 },
        { header: "Created At", key: "createdAt", width: 20 },
      ];

      tickets.forEach(t => {
        sheet.addRow({
          ...t,
          creator_name: t.creator?.name,
          creator_email: t.creator?.email,
        });
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader("Content-Disposition", `attachment; filename="tickets_export.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // CSV
      const fields = ["ticket_id", "title", "description", "priority", "status", "creator.name", "creator.email", "createdAt"];
      const json2csv = new Parser({ fields });
      const csv = json2csv.parse(tickets);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="tickets_export.csv"`);
      res.send(csv);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
};

// GET /tickets/report - ดึงข้อมูล report จาก tickets รวมถึง assigned tickets
exports.getReport = async (req, res) => {
  try {
    const { period = 'Last 7 days' } = req.query;
    
    // คำนวณวันที่เริ่มต้นตาม period
    let startDate = new Date();
    if (period === 'Last 7 days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'Last 30 days') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === 'Last 90 days') {
      startDate.setDate(startDate.getDate() - 90);
    }
    startDate.setHours(0, 0, 0, 0);

    // ดึง tickets ทั้งหมดที่สร้างในช่วงเวลาที่กำหนด (รวมถึง assigned tickets)
    const tickets = await Ticket.findAll({
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      include: [
        { model: User, as: 'assignee', attributes: ['user_id', 'name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    // คำนวณสถิติ
    const totalTickets = tickets.length;
    
    // นับตาม status
    const statusCounts = {
      'Open': 0,
      'In Progress': 0,
      'Resolved': 0,
      'Closed': 0
    };
    
    tickets.forEach(ticket => {
      const status = ticket.status;
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    // นับตาม priority
    const priorityCounts = {
      'Low': 0,
      'Medium': 0,
      'High': 0
    };
    
    tickets.forEach(ticket => {
      const priority = ticket.priority;
      if (priorityCounts.hasOwnProperty(priority)) {
        priorityCounts[priority]++;
      }
    });

    // นับ tickets ที่ถูก assign
    const assignedTickets = tickets.filter(t => t.assigned_to !== null).length;
    const openTickets = statusCounts['Open'];
    const resolvedTickets = statusCounts['Resolved'];
    const closedTickets = statusCounts['Closed'];

    // คำนวณ tickets ตามวันที่ (สำหรับกราฟ Over Time)
    let timeLabels = [];
    let timeData = [];
    
    if (period === 'Last 7 days') {
      // สำหรับ 7 วัน: แสดงแต่ละวันตามวันที่จริง
      const dayMap = new Map();
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      // สร้าง array สำหรับแต่ละวันใน 7 วันล่าสุด
      for (let i = 0; i < 7; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - (6 - i)); // เริ่มจาก 6 วันก่อน ถึงวันนี้
        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        dayMap.set(dateKey, { count: 0, label: dateLabel });
        timeLabels.push(dateLabel);
      }
      
      // นับ tickets ตามวันที่จริง
      tickets.forEach(ticket => {
        const ticketDate = new Date(ticket.created_at);
        const dateKey = ticketDate.toISOString().split('T')[0];
        if (dayMap.has(dateKey)) {
          dayMap.get(dateKey).count++;
        }
      });
      
      timeData = timeLabels.map(label => {
        for (const [key, value] of dayMap.entries()) {
          if (value.label === label) {
            return value.count;
          }
        }
        return 0;
      });
    } else {
      // สำหรับ 30 หรือ 90 วัน: แสดงตามวันในสัปดาห์ (Mon-Sun)
      const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const dayCounts = [0, 0, 0, 0, 0, 0, 0];
      
      tickets.forEach(ticket => {
        const date = new Date(ticket.created_at);
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        // แปลงเป็น index ของ array (Monday = 0)
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        if (index >= 0 && index < 7) {
          dayCounts[index]++;
        }
      });
      
      timeLabels = dayLabels;
      timeData = dayCounts;
    }

    // คำนวณเปอร์เซ็นต์การเปลี่ยนแปลง (เปรียบเทียบกับช่วงก่อนหน้า)
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);
    if (period === 'Last 7 days') {
      previousStartDate.setDate(previousStartDate.getDate() - 7);
    } else if (period === 'Last 30 days') {
      previousStartDate.setDate(previousStartDate.getDate() - 30);
    } else if (period === 'Last 90 days') {
      previousStartDate.setDate(previousStartDate.getDate() - 90);
    }

    const previousTickets = await Ticket.count({
      where: {
        created_at: {
          [Op.gte]: previousStartDate,
          [Op.lt]: previousEndDate
        }
      }
    });

    const totalChange = previousTickets > 0 
      ? `+${Math.round(((totalTickets - previousTickets) / previousTickets) * 100)}%`
      : '+0%';

    const resolvedChange = previousTickets > 0
      ? `+${Math.round(((resolvedTickets - previousTickets) / previousTickets) * 100)}%`
      : '+0%';

    // ส่งข้อมูลกลับ
    res.json({
      stats: {
        totalTickets,
        totalChange,
        openTickets,
        openSubtitle: "Needs attention",
        resolved: resolvedTickets,
        resolvedChange,
        closed: closedTickets,
        closedSubtitle: "Completed"
      },
      statusChart: {
        labels: ["Open", "In Progress", "Resolved", "Closed"],
        data: [
          statusCounts['Open'],
          statusCounts['In Progress'],
          statusCounts['Resolved'],
          statusCounts['Closed']
        ],
        colors: ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"]
      },
      priorityChart: {
        labels: ["Low", "Medium", "High"],
        data: [
          priorityCounts['Low'],
          priorityCounts['Medium'],
          priorityCounts['High']
        ]
      },
      timeChart: {
        labels: timeLabels,
        data: timeData
      },
      assignedTickets: assignedTickets
    });
  } catch (err) {
    console.error('Error in getReport:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};