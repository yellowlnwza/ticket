import React, { useEffect, useState, useMemo } from "react";
import { Link , useLocation } from "react-router-dom";
import {
  Ticket,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  Eye,
  FilePenLine,
} from "lucide-react";
import { fetchTickets } from "../services/api"; 

// Component ย่อยสำหรับ Priority Tag

// Component ย่อยสำหรับ Status Tag
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

// --- (สำคัญ) เปลี่ยนชื่อ Function เป็น DashboardPage ---
export default function DashboardAdmin() { 

  const location = useLocation();
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States สำหรับ Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // --- (ใหม่) Stat Cards (ตามดีไซน์) ---

   useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          const ticketsData = await fetchTickets(); // เรียก API จริง
          
          // แปลงข้อมูลให้ตรงกับ format
          const formattedTickets = ticketsData.map(ticket => ({
            id: ticket.id || ticket.ticket_id,
            ticket_id: `TKT-${ticket.id || ticket.ticket_id}`,
            subject: ticket.title,
            title: ticket.title,
            description: ticket.description,
            priority: ticket.priority,
            status: ticket.status,
            created_by: ticket.creator?.name || "You",
            updated_at: ticket.updated_at || ticket.created_at,
            created_at: ticket.created_at
          }));
  
          // คำนวณ stats
          const statsData = {
            open: formattedTickets.filter(t => t.status === 'Open').length,
            inProgress: formattedTickets.filter(t => t.status === 'In Progress').length,
            resolved: formattedTickets.filter(t => t.status === 'Resolved').length,
            closed: formattedTickets.filter(t => t.status === 'Closed').length,
          };
  
          setStats(statsData);
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
    }, [location.pathname]);

  // --- Logic สำหรับ Filter ตาราง ---
  const filteredTickets = useMemo(() => {
      const filtered = tickets.filter((ticket) => {
        const matchesSearch =
          (ticket.subject || ticket.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ticket.ticket_id || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "All" || ticket.status === statusFilter;
        const matchesPriority =
          priorityFilter === "All" || ticket.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      });
      
      // เรียงลำดับตาม ticket_id (TKT-1, TKT-2, TKT-3, ...)
      return filtered.sort((a, b) => {
        const aNum = parseInt(a.ticket_id.replace('TKT-', '')) || 0;
        const bNum = parseInt(b.ticket_id.replace('TKT-', '')) || 0;
        return aNum - bNum;
      });
    }, [tickets, searchTerm, statusFilter, priorityFilter]);
  

  // Stat Cards (ตามดีไซน์ใหม่)
  const statCards = [
    { key: "open", label: "Open Tickets", icon: <Ticket size={24} className="text-blue-500" /> },
    { key: "inProgress", label: "In Progress", icon: <Clock size={24} className="text-yellow-500" /> },
    { key: "resolved", label: "Resolved", icon: <CheckCircle size={24} className="text-green-500" /> },
    { key: "closed", label: "Closed", icon: <AlertTriangle size={24} className="text-gray-500" /> },
  ];
  
  if (loading) {
    return <div className="p-8"><p>กำลังโหลดข้อมูล...</p></div>;
  }
  if (error) {
    return <div className="p-8"><p className="text-red-500">{error}</p></div>;
  }

  return (
    <> 
      {/* Dashboard Title (ตามดีไซน์ใหม่) */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Support Dashboard</h1>
        <p className="text-gray-500">Manage and resolve support tickets</p>
      </div>

      {/* Stat Cards (ดีไซน์ใหม่) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500 mb-1">{card.label}</p>
              <p className="text-4xl font-bold text-slate-800">
                {stats[card.key] ?? 0}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">{card.icon}</div>
          </div>
        ))}
      </div>

       {/* Filters (ดีไซน์ใหม่) */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
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
          
          {/* Priority Filter */}
          <div className="relative">
            <select
              className="w-full sm:w-48 appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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
              <option value="Unassigned">Unassigned</option>
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div> 
      {/* Ticket Queue Section (ตาราง) */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Ticket Queue</h2>

        

        {/* Ticket Table (Responsive) */}
        <div className="overflow-x-auto">
          {/* Desktop Table (ซ่อนบนมือถือ) */}
          <table className="w-full text-left hidden md:table">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Ticket ID</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Subject</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Assignee</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Updated</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
             
               {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-semibold text-blue-600">{ticket.ticket_id}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{ticket.subject}</td>
                  <td className="py-3 px-4 text-sm"><PriorityTag priority={ticket.priority} /></td>
                  <td className="py-3 px-4 text-sm"><StatusTag status={ticket.status} /></td>
                  <td className="py-3 px-4 text-sm text-slate-700">{ticket.created_by}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">
                    {ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-3 px-8 text-sm text-gray-500 flex gap-3">
                    <Link 
                      to={`/TicketDetail/${ticket.id}`} 
                      className="hover:text-blue-600"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>    
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          {/* Mobile Card List (แสดงบนมือถือ - ตามดีไซน์) */}
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
                  </div>
                </div>
                {/* Row 2: Tags */}
                <div className="flex gap-2 my-3">
                  <PriorityTag priority={ticket.priority} />
                  <StatusTag status={ticket.status} />
                </div>
                {/* Row 3: Info */}
                <div className="text-sm text-gray-500 space-y-1">
                  <p><span className="font-medium text-slate-700">Created by:</span> {ticket.created_by}</p>
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