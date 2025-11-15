import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", data.user.name);
      // Trigger custom event to notify App component about token change
      window.dispatchEvent(new Event('tokenChange'));
      navigate("/");
    } catch {
      alert("เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลหรือรหัสผ่าน");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      {/* ===== ส่วน Header โลโก้และชื่อระบบ ===== */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          {/* สร้างโลโก้สีฟ้าด้วย CSS/SVG ให้เหมือนในรูป */}
          <div className="bg-blue-600 p-3 rounded-xl shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-800 italic">
          IT Support Ticket System
        </h1>
        <p className="mt-2 text-gray-500">Streamline your support workflow</p>
      </div>

      {/* ===== Card กล่อง Login ===== */}
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 italic mb-2">Welcome</h2>
            <p className="text-sm text-gray-500">Login to your account or create a new one</p>
        </div>

        {/* Toggle Button (Login / Register) */}
        <div className="flex bg-gray-100 p-1 rounded-full mb-6">
            <button className="w-1/2 bg-white text-slate-800 font-semibold py-2 rounded-full shadow-sm text-sm transition-all">
                Login
            </button>
            <Link 
                to="/register" 
                className="w-1/2 text-gray-500 font-medium py-2 rounded-full text-center text-sm hover:text-slate-700 transition-all"
            >
                Register
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 italic mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              required
            />
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Forgot Password?
            </button>
          </div>

          <button
            disabled={loading}
            type="submit"
            className={`w-full py-3 rounded-lg font-bold text-white text-lg tracking-wide transition shadow-md ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-800"
            }`}
            style={{ backgroundColor: '#0044cc' }} // สีน้ำเงินเข้มตามภาพ
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Hint */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4 text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-500 mb-2">Hint:</p>
            <p><span className="font-medium text-slate-700">End User:</span> user@example.com</p>
            <p><span className="font-medium text-slate-700">Staff:</span> staff@example.com</p>
            <p><span className="font-medium text-slate-700">Admin:</span> admin@example.com</p>
        </div>
      </div>
    </div>
  );
}
