import React, { useEffect, useState, Fragment } from "react";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import axios from "axios";
import { Transition } from "@headlessui/react";
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  FileText, // (ใหม่) ไอคอนสำหรับ Reports
} from "lucide-react";

export default function Navber({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // Logic เดิมสำหรับ Notifications
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // --- (ใหม่) State สำหรับ User Info บน Header ---
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("User");
  const [avatarInitial, setAvatarInitial] = useState("U"); // <--- State ใหม่สำหรับตัวย่อ

  // --- (อัปเดต) Effect สำหรับดึง Notifications ---
  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/notifications/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [token]);

  // --- (อัปเดต) Effect สำหรับดึง User Info จาก Token ---
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));

        // (อัปเดต) ตั้งค่า Role, Name, และ Avatar ตาม role_id
        if (payload.role_id === 3) {
          setUserName(payload.name || "Admin User");
          setUserRole("Administrator");
          setAvatarInitial("A"); // A for Admin
        } else if (payload.role_id === 2) {
          setUserName(payload.name || "Staff");
          setUserRole("Support Staff");
          setAvatarInitial("S"); // S for Staff
        } else {
          setUserName(payload.name || "User");
          setUserRole("End User");
          setAvatarInitial("U"); // U for User
        }
      } catch (err) {
        console.error("Token decode error:", err);
        // ตั้งค่า Default กรณี Token พัง
        setUserName("User");
        setUserRole("End User");
        setAvatarInitial("U");
      }
    }
  }, [token]);

  // --- Logic เดิม ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Trigger custom event to notify App component about token change
    window.dispatchEvent(new Event('tokenChange'));
    navigate("/login");
  };

  const handleRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:4000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  if (hideNavbar) {
    return <>{children}</>;
  }

  // --- (ใหม่) รายการเมนูสำหรับ Sidebar ---
  const navLinks = [
    { name: "Dashboard", href: "/DashboardAdmin", icon: LayoutDashboard , adminOnly: true},
    { name: "Dashboard", href: "/DashboardAdmin", icon: LayoutDashboard , staffOnly: true},
    { name: "Dashboard", href: "/DashboardUser", icon: LayoutDashboard ,userOnly:true },
    { name: "Manage Users", href: "/ManagesAdmin", icon: Users, adminOnly: true },
    { name: "Submit Ticket", href: "/SubNewTicket", icon: Ticket, userOnly: true },
    { name: "Assign Tickets", href: "/AssignAdmin", icon: Ticket, adminOnly: true },
    { name: "Assign Tickets", href: "/AssignAdmin", icon: Ticket, staffOnly: true },
    { name: "My Ticket", href: "/MyTicket", icon: Ticket, userOnly: true },
    { name: "Reports", href: "/ReportAdmin", icon: FileText, adminOnly: true },
    { name: "Reports", href: "/ReportAdmin", icon: FileText, staffOnly: true },
    { name: "System Settings", href: "/SystemSetting", icon: Settings, adminOnly: true },
    { name: "Profile", href: "/ProfileAdmin", icon: User,adminOnly: true },
    { name: "Profile", href: "/ProfileUser", icon: User,userOnly: true },
    { name: "Profile", href: "/ProfileStaff", icon: User,staffOnly: true },
  ];
  
  // (ใหม่) กรองเมนูตาม Role (สมมติว่า admin คือ role "Administrator")
  const accessibleLinks = navLinks.filter(link => {
    if (link.adminOnly) {
        return userRole === "Administrator";
    }
    if (link.userOnly){
        return userRole === "End User";
    }
     if (link.staffOnly){
        return userRole === "Support Staff";
    }
    return true;
  });

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3" onClick={() => mobileOpen && setMobileOpen(false)}>
          <div className="bg-blue-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span className="font-bold text-slate-800 text-lg">IT Support</span>
        </Link>
      </div>
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {accessibleLinks.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === "/"} // 'end' prop สำหรับ Dashboard
            onClick={() => mobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-100 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            <item.icon size={20} className="mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  // --- (อัปเดต) JSX Layout ทั้งหมด ---
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Mobile sidebar (Drawer) */}
      <Transition show={mobileOpen} as={Fragment}>
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          {/* Overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-gray-600 bg-opacity-75" onClick={() => setMobileOpen(false)} />
          </Transition.Child>

          {/* Sidebar Content */}
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex flex-col h-full max-w-xs w-full bg-white">
              <SidebarContent />
            </div>
          </Transition.Child>
        </div>
      </Transition>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-white shadow-md">
        <SidebarContent />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm h-16 flex-shrink-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
            {/* Mobile Hamburger Button */}
            <button
              className="p-2 -ml-2 text-gray-600 md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Spacer (ดันไปขวา) */}
            <div className="flex-1" />

            {/* Right side Icons & User */}
            <div className="flex items-center space-x-4">
              
              {/* Notification */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((s) => !s)}
                  className="p-2 text-gray-500 rounded-full hover:bg-gray-100"
                >
                  <Bell size={22} />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {/* Notification Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg overflow-hidden z-20">
                    <div className="p-3 font-semibold text-sm border-b">Notifications</div>
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleRead(n.id)}
                          className="p-3 text-sm hover:bg-gray-100 cursor-pointer border-b"
                        >
                          {n.message}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-gray-500 text-center">No new notifications</div>
                    )}
                  </div>
                )}
              </div>

              {/* User Info (ดีไซน์ใหม่) */}
              <div className="flex items-center">
                <div className="text-right mr-3 hidden sm:block">
                  <div className="font-semibold text-sm text-slate-700">{userName}</div>
                  <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
                  {avatarInitial}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content (Children) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}