import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { createTicket } from '../services/api';



export default function SubNewTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State สำหรับฟอร์ม
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium"); // ค่าเริ่มต้น

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ticketData = {
        title: subject,
        description: description,
        priority: priority
      };
      
      await createTicket(ticketData);
      
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
        <h1 className="text-2xl font-bold text-slate-800">Submit New Ticket</h1>
        <p className="text-gray-500">Create a new support ticket and our team will assist you</p>
      </div>

      {/* --- ฟอร์มสร้าง Ticket --- */}
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