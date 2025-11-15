# Project : IT-SUPPORT_TICKET

## 📁 โครงสร้างโปรเจกต์

```
IT-SUPPORT_TICKET/
├── backend/
│   |── config/
|   |   └── database.js 
|   |── controllers/
|   |   ├── auth.controller.js
|   |   └── tickets.controller.js
|   ├── middlewares/
|   |   ├── auth.middleware.js
|   |   ├── role.middleware.js
|   |   └── upload.middleware.js
|   ├── models/
|   |   ├── attachment.js
|   |   ├── comment.js
|   |   ├── index.js
|   |   ├── notification.js
|   |   ├── role.js
|   |   ├── ticket.js
|   |   └── user.js
|   ├── routes/
|   |   ├── auth.routes.js
|   |   ├── notifications.routes.js
|   |   └── tickets.routes.js
|   ├── uploads/
|   ├── .env
|   ├── app.js
|   ├── server.js
|   └── tesr_post_comment.js
|
├── fontend/ 
│   └── src/
|       ├── Components/
|       |   ├── CommentBox.jsx
|       |   ├── Navbar.jsx
|       |   ├── ProtectedRoute.jsx
|       |   └── TicketCard.jsx
|       ├── pages/
|       |   ├── CreateTicket.jsx
|       |   ├── DashboardAdmin.jsx
|       |   ├── DashboardUser.jsx
|       |   ├── EditTicket.jsx
|       |   ├── Login.jsx
|       |   ├── Register.jsx
|       |   ├── TicketDetail.jsx
|       |   └── TicketList.jsx
|       ├── services/
|       |   └── api.js
|       ├── App.jsx
|       └── App.css
|
├── database/
|   ├── docker-compose.yml
│   └── init.sql
|             
└── README.md
```

## 🚀 วิธี Setup และ Run โปรเจกต์

### ขั้นตอนที่ 1: แตกไฟล์โปรเจกต์
```bash
cd database
docker-compose up -d 
```
### ขั้นตอนที่ 2: Run โปรเจกต์

```bash
# run dev ใน backend
cd backend
npm run dev

# run dev ใน fontend
cd frontend
npm run dev
```
## เข้าหน้าเว็บ 

เปิดหน้าเว็บ: `http://localhost:5173/`

## เข้า phpmyadmin

เปิดphpmyadmin `http://localhost:8080/`

```
Username : root
Password : 1234
```
## User role
```
|   role      |      name     |      email      |   password   |
    Admin     | Administrator | admin@gmail.com |   12345678   |
    Staff     |    IT Staff   | staff@gmail.com |   12345678   |
    User      |   Test User   | user@gmail.com  |   12345678   |
    
```