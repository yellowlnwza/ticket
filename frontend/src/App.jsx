import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardUser from "./pages/DashboardUser";
import TicketDetail from "./pages/TicketDetail";
import CreateTicket from "./pages/CreateTicket";
import ProtectedRoute from "./Components/ProtectedRoute";
import EditTicket from "./pages/EditTicket";
import Manage from "./pages/ManagesAdmin";
import Assign from "./pages/AssignAdmin";
import Report from "./pages/ReportAdmin";
import SysSetting from "./pages/SystemSetting";
import ProAdmin from "./pages/ProfileAdmin";
import SubNewTic from "./pages/SubNewTicket";
import MyTic from "./pages/MyTicket";
import ProUser from "./pages/ProfileUser";
import ProStaff from "./pages/ProfileStaff";


export default function App() {
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState("");

  // Function to update token and role
  const updateTokenAndRole = () => {
    const currentToken = localStorage.getItem("token");
    setToken(currentToken);

    if (currentToken) {
      try {
        const payload = JSON.parse(atob(currentToken.split(".")[1]));
        // role_id 1=user, 2=staff, 3=admin
        if (payload.role_id === 3) setRole("admin");
        else if (payload.role_id === 2) setRole("staff");
        else setRole("user");
      } catch (err) {
        console.error("❌ Token decode error:", err);
        setRole("");
      }
    } else {
      setRole("");
    }
  };

  // Update token and role when localStorage changes or location changes
  useEffect(() => {
    updateTokenAndRole();
  }, [location]); // Re-run when route changes (e.g., after login/logout)

  // Listen for custom events and storage changes
  useEffect(() => {
    const handleTokenChange = () => {
      updateTokenAndRole();
    };

    // Listen for custom 'tokenChange' event (triggered by login/logout)
    window.addEventListener('tokenChange', handleTokenChange);
    
    // Listen for storage events (when token changes from other tabs)
    window.addEventListener('storage', handleTokenChange);

    return () => {
      window.removeEventListener('tokenChange', handleTokenChange);
      window.removeEventListener('storage', handleTokenChange);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar>
        <Routes>
          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              token ? (
                role === "admin" || role === "staff" ? (
                  <Navigate to="/DashboardAdmin" replace />
                ) : (
                  <Navigate to="/DashboardUser" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/ManagesAdmin" element={<Manage />} />
            <Route path="/SystemSetting" element={<SysSetting />} />
            <Route path="/ProfileAdmin" element={<ProAdmin />} />
            <Route path="/ReportAdmin" element={<Report />} />
          </Route>

          {/* Staff/Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "staff"]} />}>
            <Route path="/DashboardAdmin" element={<DashboardAdmin />} />
            <Route path="/AssignAdmin" element={<Assign />} />
            <Route path="/EditTicket/edit/:id" element={<EditTicket />} />
          </Route>

          {/* Staff-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["staff"]} />}>
            <Route path="/ProfileStaff" element={<ProStaff />} />
          </Route>

          {/* User-only routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/DashboardUser" element={<DashboardUser />} />
            <Route path="/SubNewTicket" element={<SubNewTic />} />
            <Route path="/MyTicket" element={<MyTic />} />
            <Route path="/ProfileUser" element={<ProUser />} />
          </Route>

          {/* All authenticated users can access */}
          <Route element={<ProtectedRoute />}>
            <Route path="/TicketDetail/:id" element={<TicketDetail />} />
            <Route path="/CreateTicket" element={<CreateTicket />} />
          </Route>

          {/* 404 - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Navbar>
    </div>
  );
}