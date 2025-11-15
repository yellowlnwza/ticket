# 📎 คู่มือการทำ Attachment Feature สำหรับ IT Support Ticket System

## 📋 สารบัญ
1. [ภาพรวม](#ภาพรวม)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Implementation](#frontend-implementation)
4. [Database Schema](#database-schema)
5. [Testing](#testing)
6. [Security Considerations](#security-considerations)

---

## 🎯 ภาพรวม

Attachment feature อนุญาตให้ผู้ใช้แนบไฟล์ (รูปภาพ, PDF, เอกสาร) ไปกับ Ticket ได้ ซึ่งจะช่วยให้การแก้ไขปัญหามีประสิทธิภาพมากขึ้น

### Features ที่ต้องทำ:
- ✅ อัปโหลดไฟล์เมื่อสร้าง Ticket
- ✅ แสดงไฟล์ที่แนบใน Ticket Detail
- ✅ ดาวน์โหลดไฟล์ที่แนบ
- ✅ ลบไฟล์ที่แนบ (ถ้าต้องการ)
- ✅ จำกัดประเภทและขนาดไฟล์

---

## 🔧 Backend Implementation

### 1. ติดตั้ง Dependencies

```bash
cd backend
npm install multer
```

**Multer** เป็น middleware สำหรับจัดการ file uploads ใน Express.js

### 2. สร้าง Upload Middleware

สร้างไฟล์: `backend/middlewares/upload.middleware.js`

```javascript
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// สร้าง folder uploads ถ้ายังไม่มี
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// กำหนด storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // สร้างชื่อไฟล์ที่ไม่ซ้ำ: timestamp-random-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// กำหนด file filter (ประเภทไฟล์ที่อนุญาต)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only images, PDF, and DOC files are allowed!"));
  }
};

// สร้าง multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
```

### 3. สร้าง Attachment Model

สร้างไฟล์: `backend/models/attachment.js`

```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Attachment', {
    attachment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tickets',
        key: 'ticket_id'
      }
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    original_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    uploaded_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'attachments',
    timestamps: false
  });
};
```

### 4. อัปเดต Models Index

แก้ไขไฟล์: `backend/models/index.js`

```javascript
// เพิ่ม import
const Attachment = require('./attachment')(sequelize);

// เพิ่ม association
// Ticket - Attachment
Ticket.hasMany(Attachment, { foreignKey: 'ticket_id' });
Attachment.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// User - Attachment (uploaded_by)
User.hasMany(Attachment, { foreignKey: 'uploaded_by' });
Attachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Export
module.exports = { sequelize, User, Role, Ticket, Comment, Attachment, Sla, Notification };
```

### 5. อัปเดต Ticket Controller

แก้ไขไฟล์: `backend/controllers/tickets.controller.js`

```javascript
const { Ticket, User, Comment, Notification, Attachment } = require('../models');
const upload = require('../middlewares/upload.middleware');
const fs = require('fs');
const path = require('path');

// สร้าง Ticket พร้อม Attachment
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, due_date } = req.body;

    // สร้าง Ticket
    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status: "Open",
      user_id: req.user.user_id,
      due_date: due_date || null,
    });

    // ถ้ามีไฟล์แนบมา
    if (req.file) {
      await Attachment.create({
        ticket_id: ticket.ticket_id,
        file_name: req.file.filename,
        original_name: req.file.originalname,
        file_path: `/uploads/${req.file.filename}`,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        uploaded_by: req.user.user_id,
      });
    }

    res.status(201).json({ success: true, ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ดึง Ticket พร้อม Attachments
exports.getTicketById = async (req, res) => {
  try {
    const ticketInstance = await Ticket.findByPk(req.params.id, {
      include: [
        { model: Comment, include: [{ model: User }] },
        { model: User, as: 'creator' },
        { model: Attachment, include: [{ model: User, as: 'uploader' }] }
      ]
    });

    if (!ticketInstance) return res.status(404).json({ message: 'Ticket not found' });

    const ticket = ticketInstance.get({ plain: true });
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
      })),
      attachments: (ticket.Attachments || []).map(a => ({
        id: a.attachment_id,
        file_name: a.file_name,
        original_name: a.original_name,
        file_path: a.file_path,
        file_size: a.file_size,
        mime_type: a.mime_type,
        uploaded_by: a.uploader ? a.uploader.name : 'Unknown',
        uploaded_at: a.uploaded_at
      }))
    };

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ดาวน์โหลดไฟล์
exports.downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const filePath = path.join(__dirname, '..', attachment.file_path);
    
    // ตรวจสอบว่าไฟล์มีอยู่จริง
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // ส่งไฟล์ให้ดาวน์โหลด
    res.download(filePath, attachment.original_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ลบ Attachment
exports.deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const attachment = await Attachment.findByPk(id);
    
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    // ตรวจสอบสิทธิ์ (เฉพาะเจ้าของ ticket หรือ admin)
    const ticket = await Ticket.findByPk(attachment.ticket_id);
    if (ticket.user_id !== req.user.user_id && req.user.role_id !== 3) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    // ลบไฟล์จาก server
    const filePath = path.join(__dirname, '..', attachment.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // ลบ record จาก database
    await Attachment.destroy({ where: { attachment_id: id } });

    res.json({ success: true, message: 'Attachment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
```

### 6. อัปเดต Routes

แก้ไขไฟล์: `backend/routes/tickets.routes.js`

```javascript
const upload = require('../middlewares/upload.middleware');
const { 
  createTicket, 
  getTicketById,
  downloadAttachment,
  deleteAttachment,
  // ... other imports
} = require('../controllers/tickets.controller');

// สร้าง Ticket พร้อม Attachment
router.post('/', upload.single('attachment'), createTicket);

// ดาวน์โหลดไฟล์
router.get('/attachments/:id/download', downloadAttachment);

// ลบไฟล์
router.delete('/attachments/:id', deleteAttachment);

// ... other routes
```

### 7. ตั้งค่า Static Files

แก้ไขไฟล์: `backend/app.js`

```javascript
// ต้องมีอยู่แล้ว
app.use("/uploads", express.static("uploads"));
```

---

## 🎨 Frontend Implementation

### 1. อัปเดต API Service

แก้ไขไฟล์: `frontend/src/services/api.js`

```javascript
export const createTicket = (payload, isForm = false) => {
  // ถ้าเป็น FormData ไม่ต้อง set Content-Type
  const headers = isForm && payload instanceof FormData 
    ? {} 
    : { 'Content-Type': 'application/json' };
  
  return instance.post("/tickets", payload, { headers });
};

export const downloadAttachment = (attachmentId) => {
  return instance.get(`/tickets/attachments/${attachmentId}/download`, {
    responseType: 'blob'
  });
};

export const deleteAttachment = (attachmentId) => {
  return instance.delete(`/tickets/attachments/${attachmentId}`);
};
```

### 2. สร้าง File Upload Component

สร้างไฟล์: `frontend/src/Components/FileUpload.jsx`

```javascript
import React, { useState } from 'react';
import { Upload, X, File } from 'lucide-react';

export default function FileUpload({ onFileSelect, onFileRemove, selectedFile }) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // ตรวจสอบขนาดไฟล์ (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert("Only images, PDF, and DOC files are allowed");
      return;
    }

    onFileSelect(file);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-3">
          <File size={20} className="text-blue-600" />
          <div>
            <span className="text-sm text-gray-700 font-medium">{selectedFile.name}</span>
            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onFileRemove}
          className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor="file-input"
      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <Upload size={32} className="text-gray-400 mb-2" />
        <p className="mb-2 text-sm text-gray-500">
          <span className="font-semibold">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-500">PNG, JPG, PDF, DOCX (MAX. 10MB)</p>
      </div>
      <input
        id="file-input"
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*,.pdf,.doc,.docx"
      />
    </label>
  );
}
```

### 3. อัปเดต Create Ticket Page

แก้ไขไฟล์: `frontend/src/pages/SubNewTicket.jsx` หรือ `CreateTicket.jsx`

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/api';
import FileUpload from '../Components/FileUpload';

export default function SubNewTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [file, setFile] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
  };

  const handleFileRemove = () => {
    setFile(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", subject);
      formData.append("description", description);
      formData.append("priority", priority);
      
      if (file) {
        formData.append("attachment", file);
      }
      
      await createTicket(formData, true);
      alert("Ticket submitted successfully!");
      navigate("/DashboardUser");
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      alert("Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other form fields ... */}
      
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachment (Optional)
        </label>
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          selectedFile={file}
        />
        <p className="text-xs text-gray-400 mt-1">
          You can attach screenshots, documents, or other files related to your issue.
        </p>
      </div>
      
      {/* Submit button */}
    </form>
  );
}
```

### 4. แสดง Attachments ใน Ticket Detail

แก้ไขไฟล์: `frontend/src/pages/TicketDetail.jsx`

```javascript
import { downloadAttachment, deleteAttachment } from "../services/api";
import { Download, Trash2, File } from 'lucide-react';

// ใน component
const handleDownload = async (attachment) => {
  try {
    const response = await downloadAttachment(attachment.id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.original_name);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Failed to download:", err);
    alert("Failed to download file");
  }
};

const handleDeleteAttachment = async (attachmentId) => {
  if (!window.confirm("Are you sure you want to delete this attachment?")) {
    return;
  }

  try {
    await deleteAttachment(attachmentId);
    await loadTicket(); // Reload ticket data
    alert("Attachment deleted successfully");
  } catch (err) {
    console.error("Failed to delete:", err);
    alert("Failed to delete attachment");
  }
};

// ใน JSX (เพิ่มในส่วน Ticket Detail)
{ticket.attachments && ticket.attachments.length > 0 && (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h3 className="text-lg font-semibold text-slate-800 mb-4">Attachments</h3>
    <div className="space-y-2">
      {ticket.attachments.map(attachment => (
        <div
          key={attachment.id}
          className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <File size={20} className="text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">{attachment.original_name}</p>
              <p className="text-xs text-gray-500">
                {(attachment.file_size / 1024).toFixed(2)} KB • Uploaded by {attachment.uploaded_by}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownload(attachment)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
              title="Download"
            >
              <Download size={18} />
            </button>
            {(userRole === 'admin' || ticket.creator?.id === userId) && (
              <button
                onClick={() => handleDeleteAttachment(attachment.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## 🗄️ Database Schema

### สร้าง Table Attachments

รัน SQL script นี้ใน database:

```sql
USE it_support;

CREATE TABLE IF NOT EXISTS attachments (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INT,
  mime_type VARCHAR(100),
  uploaded_by INT NOT NULL,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE
);
```

---

## 🧪 Testing

### Test Cases:

1. **Upload File**
   - ✅ อัปโหลดไฟล์รูปภาพ
   - ✅ อัปโหลดไฟล์ PDF
   - ✅ อัปโหลดไฟล์ DOCX
   - ❌ ทดสอบไฟล์ที่ใหญ่เกิน 10MB (ควร reject)
   - ❌ ทดสอบไฟล์ประเภทอื่น (ควร reject)

2. **Display Attachments**
   - ✅ แสดงไฟล์ที่แนบใน Ticket Detail
   - ✅ แสดงชื่อไฟล์, ขนาด, ผู้อัปโหลด

3. **Download**
   - ✅ ดาวน์โหลดไฟล์ได้สำเร็จ
   - ✅ ชื่อไฟล์ถูกต้อง

4. **Delete**
   - ✅ Admin สามารถลบไฟล์ได้
   - ✅ เจ้าของ Ticket สามารถลบไฟล์ได้
   - ❌ User อื่นไม่สามารถลบได้

---

## 🔒 Security Considerations

1. **File Type Validation**
   - ตรวจสอบทั้ง client และ server
   - ใช้ whitelist ของประเภทไฟล์ที่อนุญาต

2. **File Size Limit**
   - จำกัดขนาดไฟล์ที่ 10MB
   - ตรวจสอบทั้ง client และ server

3. **File Naming**
   - ใช้ชื่อไฟล์ที่ไม่ซ้ำ (timestamp + random)
   - เก็บ original name แยก

4. **Path Traversal Protection**
   - ใช้ path.join() แทน string concatenation
   - ตรวจสอบ path ก่อนเข้าถึงไฟล์

5. **Access Control**
   - ตรวจสอบสิทธิ์ก่อนดาวน์โหลด/ลบ
   - เฉพาะเจ้าของ ticket หรือ admin เท่านั้น

6. **Storage**
   - เก็บไฟล์นอก public directory
   - ใช้ static file serving สำหรับไฟล์ที่อนุญาต

---

## 📝 Checklist

- [ ] ติดตั้ง multer
- [ ] สร้าง upload middleware
- [ ] สร้าง Attachment model
- [ ] อัปเดต Ticket controller
- [ ] อัปเดต routes
- [ ] สร้าง database table
- [ ] สร้าง FileUpload component
- [ ] อัปเดต Create Ticket page
- [ ] อัปเดต Ticket Detail page
- [ ] ทดสอบ upload
- [ ] ทดสอบ download
- [ ] ทดสอบ delete
- [ ] ทดสอบ security

---

## 🎯 Tips

1. **File Storage**: พิจารณาใช้ cloud storage (AWS S3, Google Cloud Storage) สำหรับ production
2. **Image Preview**: เพิ่มฟีเจอร์ preview รูปภาพก่อนอัปโหลด
3. **Multiple Files**: สามารถขยายให้รองรับหลายไฟล์ต่อ Ticket
4. **File Compression**: บีบอัดรูปภาพก่อนบันทึกเพื่อประหยัดพื้นที่

---

## 📚 Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [React File Upload](https://react-dropzone.js.org/)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)

---

**Happy Coding! 🚀**

