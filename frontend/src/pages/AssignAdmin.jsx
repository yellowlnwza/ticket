import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchTickets, fetchStaffList } from "../services/api";
import {
  Search,
  ChevronDown,
  Eye, // ไอคอนดู
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

// --- Helper Components (สำหรับ Tag สีๆ) ---
const PriorityTag = ({ priority }) => {
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[priority] || "bg-gray-100 text-gray-700"
      }`}
    >
      {priority}
    </span>
  );
};

// ใช้สำหรับแสดง "ป้ายสถานะ" (Tag)
const StatusTag = ({ status }) => {
  const styles = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
  };
  return ( // --- ส่วนการแสดงผล (JSX) ---
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};
// --- จบ Helper Components ---

// น่าจะเป็นหน้าที่สำหรับ "Admin" ใช้ในการ "มอบหมาย" (Assign) Ticket ต่างๆ ให้กับ Staff โดยหน้านี้จะมีการดึงข้อมูล Tickets และ Staff ทั้งหมดมาแสดง
export default function AssignAdmin() {
  const location = useLocation(); // ใช้สำหรับดึงข้อมูลเกี่ยวกับ URL ปัจจุบัน (เช่น path, query params)
  const [tickets, setTickets] = useState([]); // State: เก็บรายการ "Tickets" ทั้งหมดที่จะใช้แสดงในหน้านี้ ค่าเริ่มต้นเป็น Array ว่าง `[]`
  const [staffList, setStaffList] = useState([]); // State: เก็บรายชื่อ "Staff" ทั้งหมด ใช้สำหรับแสดงใน Dropdown เพื่อเลือกคนที่จะมอบหมายงาน) ค่าเริ่มต้นเป็น Array ว่าง `[]`
  const [loading, setLoading] = useState(true); // State: เก็บสถานะการ "โหลดข้อมูล" (Loading Status) ค่าเริ่มต้นเป็น `true` เพื่อให้หน้าจอแสดง "กำลังโหลด..."
  const [error, setError] = useState(null);
  // State: เก็บ "ข้อผิดพลาด" (Error) ที่อาจเกิดขึ้นระหว่างการ fetch ข้อมูล
  // ค่าเริ่มต้นเป็น `null` (ยังไม่มี error)
  // หาก API ล้มเหลว, state นี้จะถูกตั้งค่าเป็นข้อความ Error เพื่อแสดงผล
  
  // States สำหรับ Filters
  const [searchTerm, setSearchTerm] = useState(""); // State: เก็บ "คำค้นหา" (Search Term) ที่ผู้ใช้พิมพ์ในช่อง search
  const [unassignedOnly, setUnassignedOnly] = useState(false); // เริ่มต้นเป็น "All Ticket Only"
  const [priorityFilter, setPriorityFilter] = useState("All"); // State: เก็บ "ตัวกรองระดับความสำคัญ" (Priority Filter) ค่าเริ่มต้นคือ "All" (แสดงทุกระดับ)
  const [statusFilter, setStatusFilter] = useState("All"); // State: เก็บ "ตัวกรองสถานะ" (Status Filter) ค่าเริ่มต้นคือ "All" (แสดงทุกสถานะ)

  // --- ดึงข้อมูลตอนเริ่ม ---
  const loadData = useCallback(async () => {
    try { // ตั้งสถานะเป็น "กำลังโหลด" (เพื่อแสดง spinner, disable ปุ่ม, ฯลฯ)
      setLoading(true);
      const [ticketsData, staffData] = await Promise.all([ // 1b. ดึงข้อมูล 2 ส่วนพร้อมกัน (parallel) โดยใช้ `Promise.all` เพื่อประสิทธิภาพ (ไม่ต้องรอ fetch ทีละอย่าง)
        fetchTickets(), // เรียก API จริง
        fetchStaffList().catch(() => []), // ดึง staff list (ถ้า error ให้เป็น array ว่าง)
      ]);
      
      setStaffList(staffList,staffData); // อัปเดต state ของ staffList ด้วยข้อมูลที่ดึงมา

      // แปลงข้อมูลให้ตรงกับ format ที่ใช้ใน component
      const formattedTickets = ticketsData.map((ticket) => {
        // หาชื่อ assignee จาก staffList
        const assigneeName = ticket.assigned_to
          ? staffData.find((s) => s.id === ticket.assigned_to || s.user_id === ticket.assigned_to)?.name ||
            "Unknown"
          : null;
          
        return { // คืนค่าเป็น Object ใหม่ที่มีโครงสร้างที่ "Clean"
          id: ticket.id || ticket.ticket_id,
          ticket_id: `TKT-${ticket.id || ticket.ticket_id}`,
          subject: ticket.title,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          assigned_to: ticket.assigned_to, // เก็บ ID (user_id) เดิมไว้
          assignee: assigneeName, 
          created_by: ticket.creator?.name || "Unknown", // ดึงชื่อผู้สร้าง
          updated_at: ticket.updated_at || ticket.created_at, // ใช้ updated ถ้ามี, ไม่งั้นใช้ created
          created_at: ticket.created_at,
        };
      }); // สิ้นสุด .map()
      setTickets(formattedTickets); // อัปเดต Tickets ด้วยข้อมูลที่ "แปลง" แล้ว
      setError(null); // ล้างค่า error เก่า (ถ้ามี) เพราะรอบนี้สำเร็จ
    } catch (err) {
      console.error("Failed to load user tickets:", err);
      setError("Failed to load tickets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [staffList]); // Dependency Array ของ useCallback

  useEffect(() => {
    loadData();
  }, [loadData, location.pathname]);

  // --- ฟัง event เมื่อมีการ assign ticket ---
  useEffect(() => {
    const handleTicketAssigned = () => {
      // Refresh ข้อมูลเมื่อมีการ assign ticket
      console.log("Event 'ticketAssigned' received, refreshing data...");
      loadData();
    };

    // ฟัง custom event 'ticketAssigned'
    window.addEventListener("ticketAssigned", handleTicketAssigned); // ✅ [FIXED] แก้ไขชื่อ Event

    // ฟังเมื่อ window ได้ focus (เมื่อกลับมาหน้า AssignAdmin)
    const handleFocus = () => {
      if (location.pathname === "/AssignAdmin") {
        console.log("Window focused, refreshing data...");
        loadData();
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("ticketAssigned", handleTicketAssigned); // ✅ [FIXED] แก้ไขชื่อ Event
      window.removeEventListener("focus", handleFocus);
    };
  }, [location.pathname, loadData]);

  // --- Logic การ Filter ---
  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticket_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUnassigned = !unassignedOnly || !ticket.assigned_to; // (ถ้า unassignedOnly = true, ต้องไม่มี assigned_to)
      const matchesPriority =
        priorityFilter === "All" || ticket.priority === priorityFilter;
      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      return (
        matchesSearch && matchesUnassigned && matchesPriority && matchesStatus
      );
    });
    
    // เรียงลำดับตาม ticket_id (TKT-1, TKT-2, TKT-3, ...)
    return filtered.sort((a, b) => {
      const aNum = parseInt(a.ticket_id.replace('TKT-', '')) || 0;
      const bNum = parseInt(b.ticket_id.replace('TKT-', '')) || 0;
      return aNum - bNum;
    });
  }, [tickets, searchTerm, unassignedOnly, priorityFilter, statusFilter]);

  // --- Logic การคำนวณ Stats ---
  const stats = useMemo(() => {
    const unassigned = tickets.filter((t) => !t.assigned_to).length;
    const criticalUnassigned = tickets.filter(
      (t) => !t.assigned_to && t.priority === "High"
    ).length;

    return {
      totalTickets: tickets.length,
      unassigned: unassigned,
      assigned: tickets.length - unassigned,
      criticalUnassigned: criticalUnassigned,
    };
  }, [tickets]); // คำนวณใหม่ทุกครั้งที่ 'tickets' เปลี่ยน

  // --- Stat Cards  ---
  const statCards = [
    {
      key: "totalTickets",
      label: "Total Tickets",
      icon: <Ticket size={24} className="text-blue-500" />,
    },
    {
      key: "unassigned",
      label: "Unassigned",
      icon: <Clock size={24} className="text-yellow-500" />,
    },
    {
      key: "assigned",
      label: "Assigned",
      icon: <CheckCircle size={24} className="text-green-500" />,
    },
    {
      key: "criticalUnassigned",
      label: "Critical Unassigned",
      icon: <XCircle size={24} className="text-red-500" />,
    },
  ];

  

  if (loading) return <div className="p-8">Loading data...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Assign Tickets</h1>
        <p className="text-gray-500">View and assign tickets to staff members</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-slate-800">
                {stats[card.key] ?? 0}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* --- Filters --- */}
      <div className="mb-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Dropdown Filters (Responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Unassigned Only Filter */}
          <div className="relative">
            <select
              className="w-full appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={unassignedOnly}
              onChange={(e) => setUnassignedOnly(e.target.value === "true")}
            >
              <option value="true">Unassigned Only</option>
              <option value="false">All Tickets</option>
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {/* Priority Filter */}
          <div className="relative">
            <select
              className="w-full appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {/* Status Filter */}
          <div className="relative">
            <select
              className="w-full appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <ChevronDown
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* --- ตาราง / Card List --- */}
      <div className="bg-white rounded-lg shadow-sm">
        <p className="p-4 text-sm font-semibold text-slate-600">
          Tickets ({filteredTickets.length})
        </p>

        {/* Desktop Table (ซ่อนบนมือถือ) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Ticket ID
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Subject
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Priority
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Created By
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Assignee
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Created
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600">
                    {ticket.ticket_id}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {ticket.subject}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <PriorityTag priority={ticket.priority} />
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <StatusTag status={ticket.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {ticket.created_by}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {ticket.assignee || "Unassigned"}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-8 text-sm text-gray-500  flex gap-3">
                    <Link
                      to={`/TicketDetail/${ticket.id}`}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (แสดงบนมือถือ) */}
        <div className="block md:hidden">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="border-b p-4">
              {/* Row 1: ID, Subject */}
              <div>
                <p className="text-sm font-semibold text-blue-600">
                  {ticket.ticket_id}
                </p>
                <p className="text-md font-semibold text-slate-800">
                  {ticket.subject}
                </p>
              </div>
              {/* Row 2: Tags */}
              <div className="flex gap-2 my-3">
                <PriorityTag priority={ticket.priority} />
                <StatusTag status={ticket.status} />
              </div>
              {/* Row 3: Info */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <span className="font-medium text-slate-700">
                    Created By:
                  </span>{" "}
                  {ticket.created_by}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Assignee:</span>{" "}
                  <span className="text-slate-700">
                    {ticket.assignee || "Unassigned"}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-slate-700">Created:</span>{" "}
                  {new Date(ticket.created_at).toLocaleDateString()}
                </p>
              </div>
              {/* Row 4: Actions */}
              <div className="flex gap-4 mt-3 pt-3 border-t text-gray-600">
                <Link
                  to={`/TicketDetail/${ticket.id}`}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Eye size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <p className="text-center text-gray-500 py-12">No tickets found.</p>
        )}
      </div>
    </>
  );
}