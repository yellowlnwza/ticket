import React from "react";
import { Link } from "react-router-dom";

  //ใช้สำหรับแสดงข้อมูลสรุปของ Ticket หนึ่งใบ
export default function TicketCard({ ticket, onDelete }) {
  // ---  Logic การกำหนดสีของ Status ---
  // สร้าง Object เพื่อ map สถานะ (ticket.status) ไปยัง CSS class (Tailwind)
  // `|| "..."` คือ fallback หาก status ไม่ตรงกับ key ไหนเลย (เช่น null หรือค่าอื่นๆ)
  const statusColor = {
    Open: "bg-red-100 text-red-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
  }[ticket.status] || "bg-gray-100 text-gray-700";

  // นี่เป็นข้อมูลชั่วคราวที่ใช้ map ID (assigned_to) ไปเป็นชื่อ ในระบบจริง ข้อมูลนี้ควรมาจาก API หรือ React Context
const staffList = [
  { id: 2, name: "Staff A" },
  { id: 3, name: "Staff B" },
];
  return (
    // กรอบ Card หลัก
    <div className="p-4 bg-white shadow rounded"> 
    {/* ส่วนหัว Card: Title และ Status */}
      <div className="flex justify-between items-start">
        <div>
          {/* แสดง Title */}
          <h3 className="font-semibold">
            {ticket.title} 
      </h3>
          {/* แสดง ID และ Priority */}
          <div className="text-sm text-gray-500">
            ID: {ticket.id} Level: {ticket.priority}
            
          </div>
        </div>
        {/* ใช้ `statusColor` ที่คำนวณไว้ด้านบนเพื่อเปลี่ยนสีตามสถานะ */}
        <div className={`px-2 py-1 rounded text-sm ${statusColor}`}>
          {ticket.status}
        </div>
      </div>
      {/* ส่วนแสดงผู้รับผิดชอบ (Assigned To) - จัดชิดขวา */}
      <p className="text-sm text-right text-gray-500 mb-2">
            มอบหมาย :{" "}
            {ticket.assigned_to
              ? staffList?.find((s) => s.id === ticket.assigned_to)?.name || "ไม่พบชื่อ"
              : "ยังไม่ได้มอบหมาย"}
          </p>

            {/* แสดงเนื้อหา (Description) */}
      <p className="mt-3 text-sm text-gray-600">
        เนื้อหา: {ticket.description?.slice(0, 200)}
      </p>
      <div className="mt-3 text-right">
        <Link to={`/tickets/${ticket.id}`} className="text-blue-600 text-sm">
          ดูรายละเอียด
        </Link>
      </div>
      {/* 🔹 ปุ่มแก้ไข/ลบ */}
      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/tickets/edit/${ticket.id}`}
          className="text-blue-600 text-sm hover:underline"
        >
          ✏️ แก้ไข
        </Link>
        <button
          onClick={() => onDelete(ticket.id)}
          className="text-red-500 text-sm hover:underline"
        >
          🗑️ ลบ
        </button>
      </div>
    </div>

  );
}
