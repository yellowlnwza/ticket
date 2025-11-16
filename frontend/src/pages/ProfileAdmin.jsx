import React, { useState, useEffect } from "react";

const fetchUserProfile = async (token) => {

  const payload = JSON.parse(atob(token.split(".")[1]));

  return {
    name: payload.name || "Admin User",
    email: payload.email || "admin@example.com", 
    role_id: payload.role_id || 3,
    accountId: "1",
    memberSince: "2025-01-15T10:00:00Z",
    status: "Active",
  };
};

// (จำลอง) API Call สำหรับอัปเดต
const updateUserProfile = async (profileData) => {
  console.log("Saving Profile Data:", profileData);
  // (API call to update name/email)
  return { status: "success" };
};
const updateUserPassword = async (passwordData) => {
  console.log("Changing Password:", passwordData);
  // (API call to update password)
  // ที่นี่ต้องเช็ค Current Password กับ Backend
  return { status: "success" };
};


export default function ProfileAdmin() {
  // State สำหรับข้อมูล Profile (ที่แก้ไขได้)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
  });

  // State สำหรับข้อมูล Role (ที่อ่านอย่างเดียว)
  const [userInfo, setUserInfo] = useState({
    role: "User",
    avatarInitial: "U",
    accountId: "-",
    memberSince: "-",
    status: "-",
  });

  // State สำหรับเปลี่ยนรหัสผ่าน
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(true);

  // --- ดึงข้อมูล User ตอนเริ่ม ---
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await fetchUserProfile(token); // <-- เรียก API จริง
        
        // ตั้งค่า State สำหรับ Form
        setProfile({ name: data.name, email: data.email });

        // ตั้งค่า State สำหรับข้อมูลที่แสดงอย่างเดียว
        let roleName = "End User";
        let initial = data.name ? data.name.charAt(0).toUpperCase() : "U";
        if (data.role_id === 3) {
          roleName = "Administrator";
          initial = "A";
        } else if (data.role_id === 2) {
          roleName = "Support Staff";
          initial = "S";
        }

        setUserInfo({
          role: roleName,
          avatarInitial: initial,
          accountId: data.accountId,
          memberSince: new Date(data.memberSince).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }),
          status: data.status,
        });

      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Handlers ---
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    // (ควรรีเฟรชข้อมูลจาก API อีกครั้ง)
    setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. ตรวจสอบว่ามีการอัปเดต Profile (Name/Email)
    if (profile.name !== userInfo.name || profile.email !== userInfo.email) {
      // (ควรเช็คค่าเดิมจาก State ที่ดึงมาตอนแรก ไม่ใช่ userInfo)
      await updateUserProfile(profile);
    }

    // 2. ตรวจสอบว่ามีการเปลี่ยนรหัสผ่าน
    if (passwords.newPassword) {
      if (passwords.newPassword !== passwords.confirmNewPassword) {
        alert("New passwords do not match!");
        return;
      }
      await updateUserPassword(passwords);
    }
    
    alert("Profile Updated!");
    handleReset(); // Reset ช่องรหัสผ่าน
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
        <p className="text-gray-500">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* --- คอลัมน์ซ้าย (Profile & Password) --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Profile Header */}
              <div className="p-6 border-b">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center h-16 w-16 bg-blue-600 text-white rounded-full font-bold text-2xl">
                    {userInfo.avatarInitial}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">{profile.name}</h2>
                    <p className="text-gray-500">{userInfo.role}</p>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Profile Information</h3>
                {/* (Responsive) 2 คอลัมน์บน Desktop, 1 บน Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                      value={userInfo.role}
                      disabled // Role อ่านได้อย่างเดียว
                    />
                    <p className="text-xs text-gray-400 mt-1">Contact an administrator to change your role.</p>
                  </div>
                </div>

                <hr className="my-6" />

                {/* Change Password Form */}
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Change Password</h3>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={passwords.confirmNewPassword}
                      onChange={handlePasswordChange}
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer (Save/Reset) */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-right flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* --- คอลัมน์ขวา (Account Info) --- */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Account ID</span>
                    <span className="font-medium text-slate-700">{userInfo.accountId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium text-slate-700">{userInfo.memberSince}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Account Status</span>
                    {/* (Tag สีเขียว) */}
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {userInfo.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </>
  );
}