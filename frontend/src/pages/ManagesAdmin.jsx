import React, { Fragment, useEffect, useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  ShieldOff, // ไอคอน Block
  X, // ไอคอนปิด Modal
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react"; // สำหรับ Modal

// --- (จำลอง) API Call ---
// คุณต้องแก้ส่วนนี้ให้เรียก API จริงจาก Backend ของคุณ
const fetchUsers = async () => {
  // จำลองการดึงข้อมูล
  return [
    { id: 1, name: "John Doe", email: "john.doe@company.com", role: "End User", status: "Active", created_at: "2025-01-15T10:00:00Z" },
    { id: 2, name: "Sarah Staff", email: "sarah.staff@company.com", role: "Support Staff", status: "Active", created_at: "2025-01-10T11:00:00Z" },
    { id: 3, name: "Admin User", email: "admin@company.com", role: "Administrator", status: "Active", created_at: "2025-01-10T12:00:00Z" },
    { id: 4, name: "Jane Smith", email: "jane.smith@company.com", role: "End User", status: "Active", created_at: "2025-02-01T13:00:00Z" },
    { id: 5, name: "Tom Tech", email: "tom.tech@company.com", role: "Support Staff", status: "Active", created_at: "2025-01-20T14:00:00Z" },
    { id: 6, name: "Emily Davis", email: "emily.davis@company.com", role: "End User", status: "Suspended", created_at: "2025-02-15T15:00:00Z" },
  ];
};

// --- Helper Components (สำหรับ Tag สีๆ) ---
const RoleTag = ({ role }) => {
  const styles = {
    Administrator: "bg-purple-100 text-purple-700",
    "Support Staff": "bg-blue-100 text-blue-700",
    "End User": "bg-gray-200 text-gray-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[role]}`}>{role}</span>;
};

const StatusTag = ({ status }) => {
  const styles = {
    Active: "bg-green-100 text-green-700",
    Suspended: "bg-red-100 text-red-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{status}</span>;
};
// --- จบ Helper Components ---


// --- (สำคัญ) เปลี่ยนชื่อ Function ---
export default function ManagesAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States สำหรับ Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // --- (สำคัญ) State สำหรับ Modal Add User ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State สำหรับฟอร์มใน Modal
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "End User", // ค่าเริ่มต้น
    password: "",
    confirmPassword: "",
  });

  // --- ดึงข้อมูล Users ตอนเริ่ม ---
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await fetchUsers(); // <-- เรียก API จริงตรงนี้
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err); 
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // --- Logic การ Filter ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === "All" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // --- Functions สำหรับ Modal ---
  const closeModal = () => setIsModalOpen(false);
  const openModal = () => {
    // Reset form ก่อนเปิด
    setNewUser({ name: "", email: "", role: "End User", password: "", confirmPassword: "" });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNewUser = (e) => {
    e.preventDefault();
    if (newUser.password !== newUser.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // ส่งข้อมูล newUser ไปยัง API ของคุณตรงนี้
    console.log("Adding new user:", newUser);
    // TODO: เรียก API (await addUserApi(newUser))
    
    // (จำลอง) เพิ่ม User ใหม่เข้าไปใน List
    setUsers(prev => [...prev, { ...newUser, id: Date.now(), status: "Active", created_at: new Date().toISOString() }]);

    closeModal(); // ปิด Modal เมื่อเสร็จ
  };
  // --- จบ Functions สำหรับ Modal ---


  if (loading) return <div className="p-8">Loading users...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <>
      {/* --- ส่วน Header และปุ่ม Add User --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
          <p className="text-gray-500">Add, edit, and manage user accounts</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition w-full sm:w-auto"
        >
          <Plus size={18} className="mr-2" />
          Add User
        </button>
      </div>

      {/* --- ส่วน Filters (Search & Role) --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Role Filter */}
        <div className="relative">
          <select
            className="w-full sm:w-48 appearance-none border rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Administrator">Administrator</option>
            <option value="Support Staff">Support Staff</option>
            <option value="End User">End User</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* --- ส่วนตาราง / Card List --- */}
      <div className="bg-white rounded-lg shadow-sm">
        
        <p className="p-4 text-sm font-semibold text-slate-600">Users ({filteredUsers.length})</p>
        
        {/* Desktop Table (ซ่อนบนมือถือ) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Created</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-semibold text-slate-700">{user.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-700">{user.email}</td>
                  <td className="py-3 px-4 text-sm"><RoleTag role={user.role} /></td>
                  <td className="py-3 px-4 text-sm"><StatusTag status={user.status} /></td>
                  <td className="py-3 px-4 text-sm text-slate-700">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-500 flex gap-3">
                    <button className="hover:text-blue-600"><Edit size={16} /></button>
                    <button className="hover:text-yellow-600"><ShieldOff size={16} /></button>
                    <button className="hover:text-red-600"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List (แสดงบนมือถือ) */}
        <div className="block md:hidden">
          {filteredUsers.map(user => (
            <div key={user.id} className="border-b p-4">
              {/* Row 1: Name, Email, Date */}
              <div>
                <p className="text-md font-semibold text-slate-800">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">Created: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              {/* Row 2: Tags */}
              <div className="flex gap-2 my-3">
                <StatusTag status={user.status} />
                <RoleTag role={user.role} />
              </div>
              {/* Row 3: Actions */}
              <div className="flex gap-4 text-gray-600">
                <button className="flex items-center gap-1 hover:text-blue-600"><Edit size={16} /> Edit</button>
                <button className="flex items-center gap-1 hover:text-yellow-600"><ShieldOff size={16} /> Block</button>
                <button className="flex items-center gap-1 hover:text-red-600"><Trash2 size={16} /> Delete</button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <p className="text-center text-gray-500 py-12">No users found.</p>
        )}
      </div>

      {/* --- (สำคัญ) Modal สำหรับ Add User --- */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-40" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-bold leading-6 text-slate-800 flex justify-between items-center"
                  >
                    Add New User
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                      <X size={20} />
                    </button>
                  </Dialog.Title>
                  
                  <form onSubmit={handleAddNewUser} className="mt-4 space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newUser.name}
                        onChange={handleFormChange}
                        className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={newUser.email}
                        onChange={handleFormChange}
                        className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <select
                        name="role"
                        value={newUser.role}
                        onChange={handleFormChange}
                        className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="End User">End User</option>
                        <option value="Support Staff">Support Staff</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleFormChange}
                        className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={newUser.confirmPassword}
                        onChange={handleFormChange}
                        className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Save User
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}