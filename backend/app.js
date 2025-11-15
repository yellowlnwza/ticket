const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { sequelize } = require("./models");
const authRoutes = require("./routes/auth.routes");
const ticketRoutes = require("./routes/tickets.routes");
const notificationRoutes = require('./routes/notifications.routes');

const app = express();
const server = http.createServer(app);

// ✅ เพิ่ม Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // หรือ http://localhost:5173 ถ้าใช้ React
    methods: ["GET", "POST"],
  },
});

// เก็บ socket ของผู้ใช้แต่ละคน
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // รับ user_id จาก frontend
  socket.on("register", (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ Registered user ${userId} => ${socket.id}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    for (const [userId, id] of onlineUsers.entries()) {
      if (id === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});

// ให้ใช้ใน controller ได้ทั่วระบบ
global.io = io;
global.onlineUsers = onlineUsers;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Debug route
app.get("/api/debug", async (req, res) => {
  try {
    await sequelize.authenticate();
    const { User } = require("./models");
    const admin = await User.findOne({ where: { email: "admin@example.com" } });
    res.json({
      db: "ok",
      adminExists: !!admin,
      admin: admin
        ? {
            id: admin.user_id,
            name: admin.name,
            email: admin.email,
            role_id: admin.role_id,
          }
        : null,
    });
  } catch (err) {
    console.error("debug error", err);
    res.status(500).json({ db: "error", message: err.message });
  }
});

// ✅ เชื่อม DB
async function syncDB() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: false });
  console.log("🗄️ DB connected & synced");
}
syncDB().catch(console.error);

// ✅ Root
app.get("/", (req, res) => {
  res.send("🎉 IT Support Ticket Backend is running!");
});

module.exports = app;