import React, { useState, useEffect ,useCallback} from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchTicket, updateTicket } from "../services/api";
import { ChevronRight } from "lucide-react";

export default function EditTicket() {
  const { id } = useParams(); // `useParams` Hook: ดึง "id" (ของ Ticket) ออกมาจาก URL (เช่น ถ้า URL คือ /tickets/edit/123, `id` จะมีค่า "123")
  const navigate = useNavigate(); // `useNavigate` Hook: เตรียมฟังก์ชัน `Maps` ไว้ใช้ (เช่น สั่งย้ายหน้ากลับไป /dashboard หลังจากแก้ไขสำเร็จ)
  const [ticket, setTicket] = useState(null); // State: เก็บข้อมูล Ticket ที่กำลังจะแก้ไข ค่าเริ่มต้นเป็น `null` เพราะเราต้อง "ดึงข้อมูล" (fetch) มาก่อน
  const [loading, setLoading] = useState(false); // State: เก็บสถานะการ "โหลด" (Loading) (คาดว่าจะใช้ตอน "กดปุ่ม Save/Submit" ไม่ใช่ตอนโหลดข้อมูลครั้งแรก)
  const [userRole, setUserRole] = useState(""); // State: เก็บ "Role" (สิทธิ์) ของผู้ใช้ที่กำลัง login อยู่(คาดว่าจะใช้เพื่อจำกัดสิทธิ์ว่าใครแก้ไขส่วนไหนได้บ้าง เช่น user ทั่วไปอาจแก้ได้แค่ title, แต่ admin แก้ status ได้)

  // --- Data Loading Function ---
  /**
   * ฟังก์ชันสำหรับดึงข้อมูล Ticket (ตาม `id` จาก URL) มาแสดงในฟอร์ม
   * - ใช้ `useCallback` เพื่อ memoize (จดจำ) ฟังก์ชันนี้
   * - ฟังก์ชันจะถูกสร้างใหม่ "ก็ต่อเมื่อ" `id` (จาก URL) เปลี่ยนไป
   */
  const loadTicket = useCallback(async () => {
    try {
      const data = await fetchTicket(id); // เรียก API (สมมติว่าชื่อ `fetchTicket`) เพื่อดึงข้อมูล
      setTicket({ // (สำเร็จ) อัปเดต `ticket` state ด้วยข้อมูลที่ได้มา
        title: data.title || "",
        description: data.description || "",
        priority: data.priority || "Low",
        status: data.status || "Open",
      });
    } catch (err) {
      console.error(err);
      alert("ไม่พบ Ticket นี้"); 
    }
  }, [id]); // <-- Dependency: ผูกกับ `id` จาก URL

  useEffect(() => {
    // decode token เพื่อดึง role
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role_id === 3) setUserRole("admin");
        else if (payload.role_id === 2) setUserRole("staff");
        else setUserRole("user");
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
    loadTicket();
  }, [id, loadTicket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket(prev => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateTicket(id, ticket);
      if (res.success) {
        alert("บันทึกสำเร็จ!");
        // กลับไปหน้า Ticket Detail
        navigate(`/TicketDetail/${id}`); 
      } else {
        alert("เกิดข้อผิดพลาด: " + (res.message || ""));
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดขณะบันทึก");
    } finally {
      setLoading(false);
    }
  }

  if (!ticket) {
    return <div className="p-8">Loading ticket data...</div>;
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline">Dashboard</Link>
        <ChevronRight size={16} className="mx-1" />
        <Link to="/TicketList" className="hover:underline">My Tickets</Link>
        <ChevronRight size={16} className="mx-1" />
        <span className="font-medium text-slate-700">Edit Ticket #{id}</span>
      </nav>

      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Edit Ticket</h1>
      
      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit}>
          
          {/* Form Body */}
          <div className="p-6 space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                id="title"
                name="title"
                value={ticket.title}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={ticket.description}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                id="priority"
                name="priority"
                value={ticket.priority}
                onChange={handleChange}
                className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* เฉพาะ Staff/Admin ถึงเห็นและแก้ไข status */}
            {(userRole === "admin" || userRole === "staff") && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  id="status"
                  name="status"
                  value={ticket.status}
                  onChange={handleChange}
                  className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Open</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Closed</option>
                </select>
              </div>
            )}
          </div>

          {/* Form Footer */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/TicketDetail/${id}`)} // (ปุ่ม Cancel)
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}