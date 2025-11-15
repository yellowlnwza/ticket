import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Role-based Protected Route Component
// Usage: <ProtectedRoute allowedRoles={["admin", "staff"]} />
export default function ProtectedRoute({ allowedRoles = [] }) {
  const token = localStorage.getItem("token");
  const location = useLocation();

  // Check if user is authenticated
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no role restrictions, allow all authenticated users
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Extract role from token
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roleId = payload.role_id;
    
    // Map role_id to role name
    let userRole = "";
    if (roleId === 3) userRole = "admin";
    else if (roleId === 2) userRole = "staff";
    else if (roleId === 1) userRole = "user";

    // Check if user's role is allowed
    if (!allowedRoles.includes(userRole)) {
      // Redirect based on role
      if (roleId === 3) return <Navigate to="/DashboardAdmin" replace />;
      if (roleId === 2) return <Navigate to="/DashboardAdmin" replace />;
      return <Navigate to="/DashboardUser" replace />;
    }

    return <Outlet />;
  } catch (err) {
    console.error("Token decode error:", err);
    return <Navigate to="/login" replace />;
  }
}
