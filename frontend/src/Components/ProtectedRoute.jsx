import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Component นี้ทำหน้าที่ 2 อย่างหลัก:
//  1. (Authentication) ตรวจสอบว่าผู้ใช้ Login (มี token) หรือไม่
//  2. (Authorization) ตรวจสอบว่าผู้ใช้ที่ Login แล้ว มี "สิทธิ์" (Role)เพียงพอที่จะเข้าถึงหน้านี้หรือไม่
export default function ProtectedRoute({ allowedRoles = [] }) { // ProtectedRoute Component (ตัวหุ้ม Route สำหรับการยืนยันตัวตนและสิทธิ์)
  const token = localStorage.getItem("token"); // ดึง token (ที่ใช้ยืนยันตัวตน) จาก Local Storage
  // ดึงข้อมูล "location" ปัจจุบัน (เช่น path ที่ผู้ใช้กำลังพยายามเข้า)
  // เพื่อใช้ในกรณีที่ต้อง redirect กลับมาหน้านี้ทีหลัง
  const location = useLocation(); 

  // ถ้า "ไม่มี token" (ยังไม่ได้ Login)
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />; // ให้ "ส่งกลับ" (redirect) ไปยังหน้า /login
  }

  // ถ้า `allowedRoles` เป็น array ว่าง (หมายถึง Route นี้ไม่จำกัด Role, ขอแค่ Login)
  if (allowedRoles.length === 0) {
    return <Outlet />; // `<Outlet />` คือตัวแทนของ Component ลูกที่ถูกหุ้มโดย ProtectedRoute
  }

  // กรณี "จำกัด Role" (allowedRoles มีค่า ต้องถอดรหัส token (JWT) เพื่อดู Role ของผู้ใช้
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roleId = payload.role_id;
    
    // แปลง `role_id` (ตัวเลข) ให้เป็น `userRole` (string)
    let userRole = "";
    if (roleId === 3) userRole = "admin";
    else if (roleId === 2) userRole = "staff";
    else if (roleId === 1) userRole = "user";

    // "ถ้า" Role ของผู้ใช้ (userRole) "ไม่" อยู่ใน Array ที่อนุญาต (allowedRoles)
    if (!allowedRoles.includes(userRole)) {
      // ให้ redirect ผู้ใช้กลับไปหน้า Dashboard หลัก "ของ Role ตัวเอง"
      if (roleId === 3) return <Navigate to="/DashboardAdmin" replace />;
      if (roleId === 2) return <Navigate to="/DashboardAdmin" replace />;
      return <Navigate to="/DashboardUser" replace />;
    }

    return <Outlet />; //  (ผ่าน) ถ้า Role ของผู้ใช้ "มี" อยู่ใน Array ที่อนุญาต ให้แสดง Component ลูก (Child Route) ได้
  } catch (err) { //  (ดักจับ Error) ถ้ากระบวนการ `try` ล้มเหลว (เช่น token เพี้ยน, atob ไม่ได้)
    console.error("Token decode error:", err);
    return <Navigate to="/login" replace />; // ให้ส่งผู้ใช้กลับไป Login ใหม่ (เพราะ token อาจหมดอายุหรือโดนแก้ไข)
  }
}
