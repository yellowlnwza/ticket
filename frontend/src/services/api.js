// frontend/src/services/api.js
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000/api"
});

// attach token if exists
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// -----------------------------
// Tickets
// -----------------------------
export const fetchTicket = (id) =>
  instance.get(`/tickets/${id}`).then((res) => {
    const data = res.data || {};
    const ticket = data.ticket || data;
    // normalize possible ticket_id
    if (ticket && ticket.ticket_id) {
      return { ...ticket, id: ticket.ticket_id };
    }
    return ticket;
  });

export const fetchTickets = (params = {}) =>
  instance.get("/tickets", { params }).then((res) => {
    const data = res.data || {};
    // expect { tickets: [...] } or array directly
    return data.tickets || data || [];
  });

export const createTicket = (payload) => {
  return instance.post("/tickets", payload);
};


export const getMyTickets = () =>
  instance.get("/tickets/my").then((res) => res.data || []);

// -----------------------------
// Comments
// -----------------------------
export const postComment = (ticketId, text) =>
  instance
    .post(`/tickets/${ticketId}/comments`, { text })
    .then((res) => res.data.comment || res.data);

export const addComment = (ticketId, text) =>
  instance
    .post(`/tickets/${ticketId}/comments`, { text })
    .then((res) => res.data.comment || res.data);

// -----------------------------
// Auth
// -----------------------------
export async function register(payload) {
  const res = await instance.post("/auth/register", payload); // ปรับ path ตาม backend
  return res.data;
}

export async function login(email, password) {
  const res = await instance.post("/auth/login", { email, password });
  if (res.data.token) localStorage.setItem("token", res.data.token);
  return res.data;
}

export const logout = () => {
  localStorage.removeItem("token");
};

// -----------------------------
// Ticket actions
// -----------------------------
export const assignTicket = (ticketId, assigned_to) =>
  instance.put(`/tickets/${ticketId}/assign`, { assigned_to })
    .then((res) => res.data);


export const updateTicketStatus = (ticketId, status) =>
  instance.put(`/tickets/${ticketId}/status`, { status }).then((res) => res.data);

// -----------------------------
// Stats
// -----------------------------
export const fetchStats = () =>
  instance.get("/tickets/stats").then((res) => {
    const data = res.data || {};
    return data.stats || data;
  });

  // ดึง Ticket ที่ผู้ใช้มีสิทธิ์เห็น (ตาม role)
// export async function fetchTicketsForUser() {
//   const token = localStorage.getItem("token");
//   const res = await fetch("/api/tickets/assigned", {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   if (!res.ok) throw new Error("Failed to fetch tickets");
//   return await res.json();
// }

export const fetchTicketById = (id) =>
  instance.get(`/tickets/${id}`).then((res) => {
    const data = res.data || {};
    const ticket = data.ticket || data;
    if (ticket && ticket.ticket_id) {
      return { ...ticket, id: ticket.ticket_id };
    }
    return ticket;
  });

export const updateTicket = (id, data) =>
  instance.put(`/tickets/${id}`, data).then((res) => res.data);

export const fetchMonthlyStats = () =>
  instance.get("/tickets/monthly-stats").then(res => res.data);

export const deleteTicket = (id) =>
  instance.delete(`/tickets/${id}`).then((res) => res.data);

// -----------------------------
// Staff/Users
// -----------------------------
export const fetchStaffList = () =>
  instance.get("/users/staff").then((res) => {
    const data = res.data || {};
    return data.staff || data.users || data || [];
  });

// User Management (Admin only)
export const fetchAllUsers = () =>
  instance.get("/users").then((res) => {
    const data = res.data || {};
    return data.users || [];
  });

export const createUser = (userData) =>
  instance.post("/users", userData).then((res) => res.data);

export const updateUser = (userId, userData) =>
  instance.put(`/users/${userId}`, userData).then((res) => res.data);

export const deleteUser = (userId) =>
  instance.delete(`/users/${userId}`).then((res) => res.data);

export const toggleUserStatus = (userId) =>
  instance.put(`/users/${userId}/status`).then((res) => res.data);

  
export default instance;
