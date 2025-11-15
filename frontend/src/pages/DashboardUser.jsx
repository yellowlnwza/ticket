import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Eye,
  Trash2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { fetchTickets, deleteTicket } from "../services/api"; // เรียก API จริง

// --- Helper Components (สำหรับ Tag สีๆ) ---
const PriorityTag = ({ priority }) => {
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[priority]}`}>{priority}</span>;
};

const StatusTag = ({ status }) => {
  const styles = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
};
// --- จบ Helper Components ---


export default function DashboardUser() {
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States สำหรับ Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- ดึงข้อมูลตอนเริ่ม และเมื่อ location เปลี่ยน (เช่น กลับมาจากสร้าง ticket) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const ticketsData = await fetchTickets(); // เรียก API จริง
        // แปลงข้อมูลให้ตรงกับ format ที่ใช้ใน component
        const formattedTickets = ticketsData.map(ticket => ({
          id: ticket.id || ticket.ticket_id,
          ticket_id: `TKT-${ticket.id || ticket.ticket_id}`,
          subject: ticket.title,
          title: ticket.title,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          updated_at: ticket.updated_at || ticket.created_at,
          created_at: ticket.created_at
        }));
        setTickets(formattedTickets);
        setError(null);
      } catch (err) {
        console.error("Failed to load user tickets:", err);
        setError("Failed to load tickets. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [location.pathname]); // Refresh เมื่อ pathname เปลี่ยน (เช่น กลับมาจาก SubNewTicket)

  // --- Logic การ Filter ---
  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesSearch =
        (ticket.subject || ticket.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ticket.ticket_id || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    // เรียงลำดับตาม ticket_id (TKT-1, TKT-2, TKT-3, ...)
    return filtered.sort((a, b) => {
      const aNum = parseInt(a.ticket_id.replace('TKT-', '')) || 0;
      const bNum = parseInt(b.ticket_id.replace('TKT-', '')) || 0;
      return aNum - bNum;
    });
  }, [tickets, searchTerm, statusFilter]);

  // --- ฟังก์ชันลบ Ticket ---
  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) {
      return;
    }

    try {
      const result = await deleteTicket(ticketId);
      if (result.success) {
        // ลบ ticket ออกจาก state
        setTickets(prevTickets => prevTickets.filter(t => t.id !== ticketId));
        alert("Ticket deleted successfully");
      } else {
        alert(result.message || "Failed to delete ticket");
      }
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      alert("Failed to delete ticket. Please try again.");
    }
  };

  if (loading) return <div className="p-8">Loading your tickets...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <>
      {/* Header และปุ่ม New Ticket (Responsive) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Tickets</h1>
          <p className="text-gray-500">View and track your support tickets</p>
        </div>
        <Link
          to="/SubNewTicket" // <-- (สำคัญ) Link ไปหน้าสร้าง Ticket
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full sm:w-auto"
        >
          <Plus size={18} className="mr-2" />
          New Ticket
        </Link>
      </div>

      {/* --- Filters (Search & Status) --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Status Filter */}
        <div className="relative">
          <select
            className="w-full sm:w-48 appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* --- ตาราง / Card List --- */}
      <div className="bg-white rounded-lg shadow-sm">
        
        {/* Desktop Table (ซ่อนบนมือถือ) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Ticket ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Subject</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Updated</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600">{ticket.ticket_id}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{ticket.subject}</td>
                  <td className="py-3 px-4 text-sm"><StatusTag status={ticket.status} /></td>
                  <td className="py-3 px-4 text-sm"><PriorityTag priority={ticket.priority} /></td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500 flex gap-3">
                    <Link 
                      to={`/TicketDetail/${ticket.id}`}
                      className="hover:text-blue-600"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="hover:text-red-600 transition"
                      title="Delete Ticket"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (แสดงบนมือถือ) */}
        <div className="block md:hidden">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="border-b p-4">
              {/* Row 1: ID, Subject */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-blue-600">{ticket.ticket_id}</p>
                  <p className="text-md font-semibold text-slate-800">{ticket.subject || ticket.title}</p>
                </div>
                <div className="flex gap-3 flex-shrink-0 ml-4">
                  <Link 
                    to={`/TicketDetail/${ticket.id}`}
                    className="text-gray-500 hover:text-blue-600"
                    title="View Details"
                  >
                    <Eye size={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="text-gray-500 hover:text-red-600 transition"
                    title="Delete Ticket"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              {/* Row 2: Tags */}
              <div className="flex gap-2 my-3">
                <PriorityTag priority={ticket.priority} />
                <StatusTag status={ticket.status} />
              </div>
              {/* Row 3: Info */}
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  <span className="font-medium text-slate-700">Updated:</span>{" "}
                  {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : 'N/A'}
                </p>
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