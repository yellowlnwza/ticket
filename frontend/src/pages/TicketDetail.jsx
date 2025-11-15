import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom"; // (ลบ useNavigate, เพิ่ม useCallback)
import {
  fetchTicket,
  assignTicket,
  updateTicketStatus,
  fetchStaffList,
  addComment, 
} from "../services/api"; 
import {
  ArrowLeft,
  ChevronDown,
  User,
  Send,
} from "lucide-react";

// --- Helper Components (สำหรับ Tag สีๆ) ---
const PriorityTag = ({ priority }) => {
  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority]}`}>{priority}</span>;
};
const StatusTag = ({ status }) => {
  const styles = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Resolved: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
};
// --- จบ Helper Components ---


export default function TicketDetail() {
  const { id } = useParams();
  // (ลบ navigate)
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States สำหรับ User
  const [userRole, setUserRole] = useState("");
  const [userId, setUserId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  
  // State สำหรับช่อง Comment
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- (Logic) ดึงข้อมูล User จาก Token (รันครั้งเดียว) ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserId(payload.user_id || payload.id); 
        if (payload.role_id === 3) setUserRole("admin");
        else if (payload.role_id === 2) setUserRole("staff");
        else setUserRole("user");
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, []); // <-- (วงเล็บว่าง = รันครั้งเดียว)

  // --- (Logic) โหลดข้อมูล Ticket (ใช้ useCallback) ---
  const loadTicket = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTicket(id); 
      setTicket(data);
      setError(null);
    } catch (err) {
      console.error("Failed to load ticket:", err); // (เพิ่ม err)
      setError("Failed to load ticket.");
    } finally {
      setLoading(false);
    }
  }, [id]); // <-- (ขึ้นอยู่กับ id)

  // --- (Logic) โหลด Staff (ใช้ useCallback) ---
  const loadStaff = useCallback(async () => {
    if (userRole === "admin") {
      try {
        const staff = await fetchStaffList(); 
        setStaffList(staff);
      } catch (err) {
        console.error("Failed to load staff:", err); // (เพิ่ม err)
      }
    }
  }, [userRole]); // <-- (ขึ้นอยู่กับ userRole)

  // --- useEffect (เรียก Logic) ---
  useEffect(() => {
    loadTicket();
  }, [loadTicket]); // <-- (เพิ่ม loadTicket)

  useEffect(() => {
    loadStaff();
  }, [loadStaff]); // <-- (เพิ่ม loadStaff)

  
  // --- (Logic) การส่ง Comment ---
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return; 

    setIsSubmitting(true);
    try {
      await addComment(id, commentText); 
      setCommentText(""); 
      await loadTicket(); // (โหลดข้อมูล Ticket ใหม่)
    } catch (err) {
      console.error("Failed to add comment:", err); // (เพิ่ม err)
      alert("Failed to add comment.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // --- (Logic) Actions (ย้ายมาจากเวอร์ชันเก่า) ---
  const handleAssignToMe = async () => {
    if (!userId) return alert("User ID not found.");
    try {
      await assignTicket(ticket.id, userId);
      await loadTicket();
      // Dispatch custom event เพื่อบอกให้หน้า AssignAdmin refresh
      window.dispatchEvent(new CustomEvent('ticketAssigned'));
    } catch (err) {
      console.error("Failed to assign ticket:", err); // <-- (แก้ไข) เพิ่ม err
      alert("Failed to assign ticket.");
    }
  };

  const handleChangeStatus = async (e) => {
    const newStatus = e.target.value;
    try {
      await updateTicketStatus(ticket.id, newStatus);
      await loadTicket();
    } catch (err) {
      console.error("Failed to update status:", err); // <-- (แก้ไข) เพิ่ม err
      alert("Failed to update status.");
    }
  };

  const handleReassign = async (e) => {
    const staffId = e.target.value;
    if (!staffId) return;
    try {
      await assignTicket(ticket.id, staffId);
      await loadTicket();
      // Dispatch custom event เพื่อบอกให้หน้า AssignAdmin refresh
      window.dispatchEvent(new CustomEvent('ticketAssigned'));
    } catch (err) {
      console.error("Failed to reassign ticket:", err); // <-- (แก้ไข) เพิ่ม err
      alert("Failed to reassign ticket.");
    }
  };
  // --- จบ Logic Actions ---


  if (loading) return <div className="p-8">Loading ticket details...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!ticket) return <div className="p-8">No ticket data found.</div>;

  // (Helper) หาชื่อ Assignee
  const assigneeName = staffList.find(s => s.id === ticket.assigned_to)?.name || "Unassigned";

  return (
    <>
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link to={userRole === 'user' ? '/' : '/AssignAdmin'} className="flex items-center text-gray-500 hover:text-blue-600">
          <ArrowLeft size={18} className="mr-2" />
          Back to Tickets
        </Link>
      </div>

      {/* Layout 2 คอลัมน์ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- คอลัมน์ซ้าย (เนื้อหา) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Ticket Header & Description */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h1 className="text-xl font-bold text-slate-800">{ticket.ticket_id}</h1>
              <h2 className="text-2xl font-semibold text-slate-800 mt-1">{ticket.title}</h2>
              <div className="flex gap-2 mt-3">
                <PriorityTag priority={ticket.priority} />
                <StatusTag status={ticket.status} />
              </div>
            </div>
            <hr />
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Description</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          </div>

          {/* Card: Comments */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-slate-800">Comments ({ticket.comments?.length || 0})</h3>
            </div>
            
            {/* List Comments */}
            <div className="p-6 space-y-5">
              {ticket.comments && ticket.comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-white
                    ${comment.role === 'staff' || comment.role === 'admin' ? 'bg-blue-600' : 'bg-gray-400'}
                  `}>
                    {comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 border-b pb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-semibold text-slate-800">
                        {comment.author}
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {comment.role}
                        </span>
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.text}</p>
                  </div>
                </div>
              ))}
              
              {(!ticket.comments || ticket.comments.length === 0) && (
                <p className="text-sm text-gray-500 text-center">No comments yet.</p>
              )}
            </div>
            
            {/* Add Comment Form */}
            <div className="bg-gray-50 p-4 rounded-b-lg">
              <form onSubmit={handleSubmitComment}>
                <label htmlFor="commentText" className="text-sm font-semibold text-gray-600">Add Comment</label>
                <textarea
                  id="commentText"
                  rows="4"
                  className="mt-2 w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your comment here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
                <div className="text-right mt-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center ml-auto"
                    disabled={isSubmitting}
                  >
                    <Send size={16} className="mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* --- คอลัมน์ขวา (Info & Actions) --- */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card: Ticket Information */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Ticket Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created By</span>
                  <span className="font-medium text-slate-700">{ticket.created_by}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Assigned To</span>
                  <span className="font-medium text-slate-700">{assigneeName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-slate-700">{ticket.category || 'Email'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Created</span>
                  <span className="font-medium text-slate-700">{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="font-medium text-slate-700">{new Date(ticket.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Actions (เฉพาะ Admin/Staff) */}
          {(userRole === 'admin' || userRole === 'staff') && (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-5">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Actions</h3>
                <div className="space-y-4">
                  
                  {/* Change Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Change Status</label>
                    <div className="relative">
                      <select
                        id="status"
                        className="w-full appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={ticket.status}
                        onChange={handleChangeStatus}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>
                      <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  {/* Reassign Ticket (เฉพาะ Admin) */}
                  {userRole === 'admin' && (
                    <div>
                      <label htmlFor="reassign" className="block text-sm font-medium text-gray-700">Reassign Ticket</label>
                      <div className="relative ">
                        <select
                          id="reassign"
                          className="w-full appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onChange={handleReassign}
                          value={ticket.assigned_to || ""}
                        >
                          <option value="">Select Staff</option>
                          {staffList.map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Assign to Me (ถ้ายังไม่ถูก Assign) */}
                  {ticket.assigned_to !== userId && (
                    <button
                      onClick={handleAssignToMe}
                      className="w-full bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-200 transition"
                    >
                      Assign to Me
                    </button>
                  )}

                </div>
              </div>
            </div>
          )}
          
        </div>

      </div>
    </>
  );
}