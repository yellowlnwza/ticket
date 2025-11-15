import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Upload, X } from 'lucide-react';
import { createTicket } from '../services/api';


// (สำคัญ) เปลี่ยนชื่อ Function ให้ตรงกับชื่อไฟล์
export default function SubNewTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State สำหรับฟอร์ม
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium"); // ค่าเริ่มต้น
  const [file, setFile] = useState(null); // เพิ่ม state สำหรับไฟล์
  const [fileName, setFileName] = useState(""); // สำหรับแสดงชื่อไฟล์

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    // Reset file input
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ใช้ FormData เมื่อมีไฟล์ หรือไม่มีไฟล์ก็ใช้ได้
      const formData = new FormData();
      formData.append("title", subject);
      formData.append("description", description);
      formData.append("priority", priority);
      if (file) {
        formData.append("attachment", file);
      }
      
      await createTicket(formData, true); // ส่ง FormData
      
      alert("Ticket submitted successfully!");
      navigate("/DashboardUser"); // กลับไปหน้า Dashboard User
    } catch (err) {
      console.error("Failed to submit ticket:", err);
      alert("Failed to submit ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/"); // กด Cancel กลับไปหน้า Dashboard
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        {/* (Breadcrumb - optional) */}
        {/* <p className="text-sm text-gray-500 mb-1">Dashboard > Submit Ticket</p> */}
        <h1 className="text-2xl font-bold text-slate-800">Submit New Ticket</h1>
        <p className="text-gray-500">Create a new support ticket and our team will assist you</p>
      </div>

      {/* --- (ใหม่) ฟอร์มสร้าง Ticket --- */}
      <div className="bg-white rounded-lg shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed information about your issue..."
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Please include as much detail as possible to help us resolve your issue faster.
              </p>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <div className="relative mt-1">
                <select
                  id="priority"
                  name="priority"
                  className="w-full appearance-none bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 pr-10 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  required
                >
                  <option value="Low">Low - Minor issue</option>
                  <option value="Medium">Medium - Normal issue</option>
                  <option value="High">High - Critical issue</option>
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* File Attachment */}
            <div>
              <label htmlFor="file-input" className="block text-sm font-medium text-gray-700 mb-2">
                Attachment (Optional)
              </label>
              {!file ? (
                <label
                  htmlFor="file-input"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
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
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Upload size={20} className="text-blue-600" />
                    <span className="text-sm text-gray-700 font-medium">{fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                You can attach screenshots, documents, or other files related to your issue.
              </p>
            </div>
          </div>

          {/* Form Footer (Buttons) */}
          <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}