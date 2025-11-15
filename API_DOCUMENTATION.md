# 📚 API Documentation - IT Support Ticket System

เอกสารนี้อธิบาย API Endpoints ทั้งหมดของระบบ IT Support Ticket System

**Base URL:** `http://localhost:4000/api`

**Version:** 1.0.0

---

## 📋 สารบัญ

1. [Authentication APIs](#1-authentication-apis)
2. [Tickets APIs](#2-tickets-apis)
3. [Users APIs](#3-users-apis)
4. [Notifications APIs](#4-notifications-apis)
5. [Error Codes](#5-error-codes)
6. [Response Format](#6-response-format)

---

## 🔐 Authentication

### การยืนยันตัวตน

API ส่วนใหญ่ต้องการ JWT Token ใน Header:

```
Authorization: Bearer {your_jwt_token}
```

### การรับ Token

ใช้ endpoint `/api/auth/login` เพื่อรับ token

---

## 1. Authentication APIs

### 1.1 ลงทะเบียน (Register)

สร้างบัญชีผู้ใช้ใหม่

**Endpoint:** `POST /api/auth/register`

**Authentication:** ไม่ต้อง

**Request Body:**
```json
{
  "name": "ชื่อ-นามสกุล",
  "email": "user@example.com",
  "password": "รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
}
```

**Validation Rules:**
- `name`: ความยาว 2-100 ตัวอักษร (required)
- `email`: รูปแบบ email ที่ถูกต้อง, ต้องไม่ซ้ำในระบบ (required)
- `password`: อย่างน้อย 8 ตัวอักษร, มีตัวพิมพ์ใหญ่ 1 ตัว, มีตัวเลข 1 ตัว (required)

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "user_id": 4,
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 1,
    "status": "Active"
  }
}
```

**Error Responses:**

**400 - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

### 1.2 เข้าสู่ระบบ (Login)

เข้าสู่ระบบและรับ JWT Token

**Endpoint:** `POST /api/auth/login`

**Authentication:** ไม่ต้อง

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "รหัสผ่าน"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 1,
    "role_name": "User"
  }
}
```

**Token Expiration:** 8 ชั่วโมง

**Error Responses:**

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**403 - Account Suspended:**
```json
{
  "success": false,
  "message": "Account is suspended"
}
```

---

## 2. Tickets APIs

### 2.1 ดึง Tickets ทั้งหมด

ดึงรายการ Tickets (User เห็นแค่ของตัวเอง, Staff/Admin เห็นทั้งหมด)

**Endpoint:** `GET /api/tickets`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): กรองตามสถานะ (Open, In Progress, Resolved, Closed)
- `priority` (optional): กรองตามความสำคัญ (Low, Medium, High)
- `page` (optional): หน้าที่ต้องการ (default: 1)
- `limit` (optional): จำนวนต่อหน้า (default: 20)

**Example Request:**
```bash
GET /api/tickets?status=Open&priority=High&page=1&limit=10
Authorization: Bearer {token}
```

**Success Response (200):**
```json
[
  {
    "id": 1,
    "title": "Printer ชั้น 3 ใช้งานไม่ได้",
    "description": "Printer แสดงข้อความ Paper Jam",
    "status": "In Progress",
    "priority": "High",
    "assigned_to": 2,
    "assignee": {
      "id": 2,
      "name": "IT Staff"
    },
    "creator": {
      "id": 3,
      "name": "Test User"
    },
    "created_at": "2025-11-16T10:30:00.000Z",
    "updated_at": "2025-11-16T11:00:00.000Z"
  }
]
```

**Role-based Filtering:**
- **User (role_id = 1):** เห็นเฉพาะ tickets ที่ตัวเองสร้าง
- **Staff (role_id = 2):** เห็น tickets ทั้งหมด
- **Admin (role_id = 3):** เห็น tickets ทั้งหมด

---

### 2.2 ดู Ticket ตาม ID

ดูรายละเอียดของ Ticket พร้อม Comments

**Endpoint:** `GET /api/tickets/:id`

**Authentication:** Required

**URL Parameters:**
- `id` (required): Ticket ID

**Example Request:**
```bash
GET /api/tickets/1
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Printer ชั้น 3 ใช้งานไม่ได้",
  "description": "Printer แสดงข้อความ Paper Jam แต่ตรวจสอบแล้วไม่มีกระดาษติด",
  "priority": "High",
  "status": "In Progress",
  "assigned_to": 2,
  "creator": {
    "user_id": 3,
    "name": "Test User",
    "email": "user@gmail.com"
  },
  "comments": [
    {
      "id": 1,
      "author": "IT Staff",
      "text": "กำลังตรวจสอบปัญหา จะแจ้งผลภายในบ่าย",
      "created_at": "2025-11-16T10:45:00.000Z"
    }
  ],
  "created_at": "2025-11-16T10:30:00.000Z",
  "updated_at": "2025-11-16T11:00:00.000Z"
}
```

**Error Responses:**

**404 - Not Found:**
```json
{
  "message": "Ticket not found"
}
```

---

### 2.3 สร้าง Ticket ใหม่

สร้าง Support Ticket ใหม่

**Endpoint:** `POST /api/tickets`

**Authentication:** Required

**Request Body:**
```json
{
  "title": "หัวข้อปัญหา",
  "description": "รายละเอียดปัญหา",
  "priority": "Medium"
}
```

**Validation Rules:**
- `title`: ความยาว 5-200 ตัวอักษร (required)
- `description`: ความยาว 10-5000 ตัวอักษร (required)
- `priority`: ค่าที่อนุญาต Low, Medium, High (required)

**Success Response (201):**
```json
{
  "success": true,
  "ticket": {
    "ticket_id": 5,
    "title": "หัวข้อปัญหา",
    "description": "รายละเอียดปัญหา",
    "priority": "Medium",
    "status": "Open",
    "user_id": 3,
    "assigned_to": null,
    "created_at": "2025-11-16T14:00:00.000Z",
    "updated_at": "2025-11-16T14:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 5-200 characters"
    }
  ]
}
```

---

### 2.4 แก้ไข Ticket

แก้ไขข้อมูล Ticket (เฉพาะเจ้าของ Ticket)

**Endpoint:** `PUT /api/tickets/:id`

**Authentication:** Required

**Permissions:**
- เจ้าของ Ticket สามารถแก้ไข title, description, priority
- Staff/Admin สามารถแก้ไข status เพิ่มเติม

**Request Body:**
```json
{
  "title": "หัวข้อใหม่",
  "description": "รายละเอียดใหม่",
  "priority": "High",
  "status": "In Progress"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "ticket": {
    "ticket_id": 1,
    "title": "หัวข้อใหม่",
    "description": "รายละเอียดใหม่",
    "priority": "High",
    "status": "In Progress",
    "updated_at": "2025-11-16T15:00:00.000Z"
  }
}
```

**Error Responses:**

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "You can only edit tickets that you created"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Ticket not found"
}
```

---

### 2.5 ลบ Ticket

ลบ Ticket (เฉพาะเจ้าของหรือ Admin)

**Endpoint:** `DELETE /api/tickets/:id`

**Authentication:** Required

**Permissions:**
- เจ้าของ Ticket
- Admin (role_id = 3)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket deleted successfully"
}
```

**Error Responses:**

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "You can only delete tickets that you created"
}
```

---

### 2.6 เปลี่ยนสถานะ Ticket

เปลี่ยนสถานะของ Ticket (เฉพาะ Staff/Admin)

**Endpoint:** `PUT /api/tickets/:id/status`

**Authentication:** Required

**Permissions:** Staff (role_id = 2) หรือ Admin (role_id = 3)

**Request Body:**
```json
{
  "status": "Resolved"
}
```

**Allowed Status Flow:**
- `Open` → `In Progress`
- `In Progress` → `Resolved`
- `Resolved` → `Closed`
- `Resolved` → `In Progress` (Reopen)

**Success Response (200):**
```json
{
  "success": true,
  "ticket": {
    "ticket_id": 1,
    "status": "Resolved",
    "updated_at": "2025-11-16T16:00:00.000Z"
  }
}
```

**Side Effects:**
- สร้าง Notification ให้เจ้าของ Ticket
- ส่ง Real-time notification ผ่าน Socket.io

**Error Responses:**

**403 - Access Denied:**
```json
{
  "success": false,
  "message": "Access denied: only staff or admin can update ticket status."
}
```

---

### 2.7 มอบหมาย Ticket

มอบหมาย Ticket ให้เจ้าหน้าที่ (Staff/Admin)

**Endpoint:** `PUT /api/tickets/:id/assign`

**Authentication:** Required

**Permissions:**
- Staff สามารถมอบหมายให้ตัวเองเท่านั้น
- Admin สามารถมอบหมายให้ Staff คนใดก็ได้

**Request Body:**
```json
{
  "assigned_to": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ticket assigned successfully.",
  "ticket": {
    "ticket_id": 1,
    "assigned_to": 2,
    "status": "In Progress",
    "updated_at": "2025-11-16T16:30:00.000Z"
  }
}
```

**Side Effects:**
- เปลี่ยน status เป็น "In Progress" อัตโนมัติ (ถ้ายังเป็น "Open")

**Error Responses:**

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "Staff can only assign ticket to themselves"
}
```

**404 - Staff Not Found:**
```json
{
  "message": "Staff not found"
}
```

---

### 2.8 เพิ่ม Comment

เพิ่ม Comment ใน Ticket

**Endpoint:** `POST /api/tickets/:id/comments`

**Authentication:** Required

**Request Body:**
```json
{
  "text": "ข้อความ comment"
}
```

**Validation:**
- `text`: ความยาว 1-2000 ตัวอักษร (required)

**Success Response (201):**
```json
{
  "success": true,
  "comment": {
    "id": 5,
    "author": "IT Staff",
    "text": "ได้แก้ไขปัญหาเรียบร้อยแล้ว",
    "created_at": "2025-11-16T17:00:00.000Z"
  }
}
```

**Side Effects:**
- สร้าง Notification ให้เจ้าของ Ticket
- ส่ง Real-time notification ผ่าน Socket.io

---

### 2.9 ดูสถิติ Tickets

ดูสถิติภาพรวมของ Tickets

**Endpoint:** `GET /api/tickets/stats`

**Authentication:** Required

**Success Response (200):**
```json
{
  "total": 150,
  "open": 25,
  "inProgress": 45,
  "resolved": 50,
  "closed": 30
}
```

---

### 2.10 ดูสถิติ Tickets ของตัวเอง

ดูสถิติ Tickets ของ User ที่ login อยู่

**Endpoint:** `GET /api/tickets/my`

**Authentication:** Required

**Success Response (200):**
```json
{
  "total": 15,
  "open": 3,
  "inProgress": 5,
  "resolved": 5,
  "closed": 2
}
```

---

### 2.11 Export Tickets (Admin Only)

Export ข้อมูล Tickets เป็น CSV หรือ Excel

**Endpoint:** `GET /api/tickets/export`

**Authentication:** Required

**Permissions:** Admin (role_id = 3)

**Query Parameters:**
- `format` (optional): "csv" หรือ "xlsx" (default: "csv")

**Example Requests:**
```bash
# Export เป็น CSV
GET /api/tickets/export?format=csv

# Export เป็น Excel
GET /api/tickets/export?format=xlsx
```

**Success Response:**
- Content-Type: `text/csv` หรือ `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- ไฟล์จะถูก download โดยอัตโนมัติ

**Error Responses:**

**403 - Access Denied:**
```json
{
  "message": "Access denied"
}
```

---

### 2.12 ดูรายงาน (Report)

ดูรายงานสถิติ Tickets พร้อมกราฟ

**Endpoint:** `GET /api/tickets/report`

**Authentication:** Required

**Query Parameters:**
- `period` (optional): "Last 7 days", "Last 30 days", "Last 90 days" (default: "Last 7 days")

**Example Request:**
```bash
GET /api/tickets/report?period=Last 30 days
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "stats": {
    "totalTickets": 150,
    "totalChange": "+15%",
    "openTickets": 25,
    "openSubtitle": "Needs attention",
    "resolved": 50,
    "resolvedChange": "+20%",
    "closed": 30,
    "closedSubtitle": "Completed"
  },
  "statusChart": {
    "labels": ["Open", "In Progress", "Resolved", "Closed"],
    "data": [25, 45, 50, 30],
    "colors": ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"]
  },
  "priorityChart": {
    "labels": ["Low", "Medium", "High"],
    "data": [40, 70, 40]
  },
  "timeChart": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "data": [15, 20, 18, 25, 22, 10, 8]
  },
  "assignedTickets": 95
}
```

---

## 3. Users APIs

### 3.1 ดึงผู้ใช้ทั้งหมด (Admin Only)

ดูรายการผู้ใช้ทั้งหมดในระบบ

**Endpoint:** `GET /api/users`

**Authentication:** Required

**Permissions:** Admin (role_id = 3)

**Success Response (200):**
```json
{
  "users": [
    {
      "user_id": 1,
      "name": "Administrator",
      "email": "admin@gmail.com",
      "role_id": 3,
      "role_name": "Admin",
      "status": "Active",
      "created_at": "2025-11-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3.2 ดึงรายการ Staff

ดูรายการเจ้าหน้าที่ทั้งหมด (สำหรับมอบหมาย Ticket)

**Endpoint:** `GET /api/users/staff`

**Authentication:** Required

**Permissions:** Staff/Admin

**Success Response (200):**
```json
{
  "staff": [
    {
      "user_id": 2,
      "name": "IT Staff",
      "email": "staff@gmail.com"
    }
  ]
}
```

---

### 3.3 สร้างผู้ใช้ใหม่ (Admin Only)

สร้างผู้ใช้ใหม่โดย Admin

**Endpoint:** `POST /api/users`

**Authentication:** Required

**Permissions:** Admin

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@gmail.com",
  "password": "12345678",
  "role_id": 1
}
```

**Success Response (201):**
```json
{
  "success": true,
  "user": {
    "user_id": 10,
    "name": "New User",
    "email": "newuser@gmail.com",
    "role_id": 1,
    "status": "Active"
  }
}
```

---

### 3.4 แก้ไขผู้ใช้ (Admin Only)

แก้ไขข้อมูลผู้ใช้

**Endpoint:** `PUT /api/users/:id`

**Authentication:** Required

**Permissions:** Admin

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@gmail.com",
  "role_id": 2
}
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "user_id": 10,
    "name": "Updated Name",
    "email": "updated@gmail.com",
    "role_id": 2
  }
}
```

---

### 3.5 ลบผู้ใช้ (Admin Only)

ลบผู้ใช้ออกจากระบบ

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Required

**Permissions:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

### 3.6 เปลี่ยนสถานะผู้ใช้ (Admin Only)

เปลี่ยนสถานะผู้ใช้ (Active ⟷ Suspended)

**Endpoint:** `PUT /api/users/:id/status`

**Authentication:** Required

**Permissions:** Admin

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated",
  "status": "Suspended"
}
```

---

## 4. Notifications APIs

### 4.1 ดึงการแจ้งเตือน

ดูการแจ้งเตือนของตัวเอง

**Endpoint:** `GET /api/notifications`

**Authentication:** Required

**Success Response (200):**
```json
{
  "notifications": [
    {
      "notification_id": 1,
      "message": "สถานะของ Ticket #1 ถูกเปลี่ยนเป็น 'Resolved'",
      "is_read": false,
      "created_at": "2025-11-16T18:00:00.000Z"
    }
  ]
}
```

---

### 4.2 ทำเครื่องหมายว่าอ่านแล้ว

ทำเครื่องหมาย notification ว่าอ่านแล้ว

**Endpoint:** `PUT /api/notifications/:id/read`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 5. Error Codes

### HTTP Status Codes

| Code | ความหมาย | คำอธิบาย |
|------|----------|----------|
| 200 | OK | สำเร็จ |
| 201 | Created | สร้างข้อมูลสำเร็จ |
| 400 | Bad Request | ข้อมูลไม่ถูกต้อง |
| 401 | Unauthorized | ไม่มี Token หรือ Token ไม่ถูกต้อง |
| 403 | Forbidden | ไม่มีสิทธิ์เข้าถึง |
| 404 | Not Found | ไม่พบข้อมูล |
| 409 | Conflict | ข้อมูลซ้ำ (เช่น email ซ้ำ) |
| 500 | Server Error | เกิดข้อผิดพลาดในระบบ |

---

## 6. Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation message"
    }
  ]
}
```

---

## 🔧 ตัวอย่างการใช้งาน

### ตัวอย่าง 1: Login และสร้าง Ticket

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@gmail.com',
    password: '12345678'
  })
});

const { token } = await loginResponse.json();

// 2. สร้าง Ticket
const ticketResponse = await fetch('http://localhost:4000/api/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Printer ใช้งานไม่ได้',
    description: 'Printer แสดง error Paper Jam',
    priority: 'High'
  })
});
```

---

## 📌 หมายเหตุ

1. **Token Expiration:** JWT Token จะหมดอายุใน 8 ชั่วโมง
2. **Rate Limiting:** จำกัด 100 requests ต่อ 15 นาที ต่อ IP
3. **CORS:** รองรับทุก origin ใน development
4. **Real-time:** ใช้ Socket.io สำหรับ notifications (port 4000)

---

**เวอร์ชัน:** 1.0.0  
**Last Updated:** 16 พฤศจิกายน 2025
