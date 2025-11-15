import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../services/api";

export default function CreateTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
     try {
      // ✅ ใช้ FormData เพื่อส่งไฟล์และข้อมูลอื่น ๆ ไป backend
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("priority", priority);
      if (file) formData.append("attachment", file);
      
      await createTicket(formData, true); // ส่งไป API (isForm = true สำหรับ FormData)
      alert("สร้าง Ticket สำเร็จ");
      navigate("/TicketList");
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถสร้าง Ticket ได้");
    }
  }

  return (
    <main className="flex flex-col h-full justify-start mx-auto bg-white p-6 shadow rounded">
      <h1 className="text-xl font-semibold mb-4">สร้าง Ticket ใหม่</h1>
      <form onSubmit={handleSubmit} className="space-y-3 flex flex-col flex-1">
  <div>
    <label className="text-sm">หัวข้อ</label>
    <input
      className="w-full border rounded p-2"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      required
    />
  </div>

  <div>
    <label className="text-sm">รายละเอียด</label>
    <textarea
      className="w-full border rounded p-2"
      rows="4"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      required
    />
  </div>

  <div>
    <label className="text-sm">ความสำคัญ</label>
    <select
      className="w-full border rounded p-2"
      value={priority}
      onChange={(e) => setPriority(e.target.value)}
    >
      <option>Low</option>
      <option>Medium</option>
      <option>High</option>
    </select>
  </div>

 <input
  type="file"
  name="attachment" // ต้องตรงกับ multer.single("attachment")
  onChange={(e) => setFile(e.target.files[0])}
/>

  <button
    type="submit"
    className="w-full bg-blue-500 text-white py-2 rounded"
  >
    สร้าง Ticket
  </button>
</form>
    </main>
  );
}
