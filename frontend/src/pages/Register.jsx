import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";

export default function Register() {
  // State จากโค้ดเดิมของคุณ
  const [name, setName] = useState(""); // ใช้ 'name' เหมือนเดิม (UI Label คือ Full Name)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // State ใหม่ที่เพิ่มตาม UI
  const [role, setRole] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    // (เพิ่ม) ตรวจสอบรหัสผ่านว่าตรงกันหรือไม่
    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน (Passwords do not match)");
      return;
    }
    
    setLoading(true);
    try {
      // (อัปเดต) ส่ง 'role' เพิ่มเข้าไปในการเรียก API
      await register({ name, email, password, role });
      alert("สมัครสมาชิกสำเร็จ");
      navigate("/login"); // ไปหน้า login หลังสมัครเสร็จ
    } catch {
      alert("ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ===== Header ส่วนโลโก้ (เหมือนหน้า Login) ===== */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-xl shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 italic">
          IT Support Ticket System
        </h1>
        <p className="mt-2 text-gray-500">Streamline your support workflow</p>
      </div>

      {/* ===== Card กล่อง Register ===== */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 italic mb-2">Welcome</h2>
            <p className="text-sm text-gray-500">Login to your account or create a new one</p>
        </div>

        {/* Toggle Button (Login / Register) - สลับ Active มาที่ Register */}
        <div className="flex bg-gray-100 p-1 rounded-full mb-6">
            <Link 
                to="/login" 
                className="w-1/2 text-gray-500 font-medium py-2 rounded-full text-center text-sm hover:text-slate-700 transition-all"
            >
                Login
            </Link>
            <button className="w-1/2 bg-white text-slate-800 font-semibold py-2 rounded-full shadow-sm text-sm transition-all">
                Register
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">Full Name</label>
            <input
              type="text"
              className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={name} // ใช้ state 'name'
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">Role</label>
            <div className="relative">
                <select
                className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                >
                    <option value="" disabled>Select Role</option>
                    <option value="enduser">End User</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                </select>
                {/* ลูกศร Dropdown Custom */}
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">Confirm Password</label>
            <input
              type="password"
              className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-white text-lg tracking-wide transition shadow-md mt-4 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
            }`}
            style={{ backgroundColor: '#0044cc' }}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}