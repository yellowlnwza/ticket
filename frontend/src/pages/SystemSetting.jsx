import React, { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

// ---  Toggle Switch---
const ToggleSwitch = ({ id, name, checked, onChange, label }) => (
  <label htmlFor={id || name} className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      id={id || name}
      name={name}
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
    {label && <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>}
  </label>
);

// --- Priority Tag  ---
const PriorityTag = ({ priority }) => {
  const styles = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[priority] || 'bg-gray-100 text-gray-700'}`}>{priority}</span>;
};


// ---  "General" ---
const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    systemName: "IT Support Ticket System",
    systemEmail: "support@company.com",
    defaultPriority: "Medium",
    autoAssign: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving General Settings:", settings);
    alert("General Settings Saved!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-800">General Settings</h2>
        <p className="text-gray-500 mt-1">Configure basic system settings</p>
        <div className="mt-6 space-y-5">
          {/* System Name */}
          <div>
            <label htmlFor="systemName" className="block text-sm font-medium text-gray-700">System Name</label>
            <input type="text" id="systemName" name="systemName"
              className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.systemName} onChange={handleChange}
            />
          </div>
          {/* System Email */}
          <div>
            <label htmlFor="systemEmail" className="block text-sm font-medium text-gray-700">System Email</label>
            <input type="email" id="systemEmail" name="systemEmail"
              className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.systemEmail} onChange={handleChange}
            />
          </div>
          {/* Default Priority */}
          <div>
            <label htmlFor="defaultPriority" className="block text-sm font-medium text-gray-700">Default Ticket Priority</label>
            <div className="relative mt-1">
              <select id="defaultPriority" name="defaultPriority"
                className="w-full appearance-none bg-gray-100 border border-transparent rounded-lg px-4 py-3 pr-10 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={settings.defaultPriority} onChange={handleChange}
              >
                <option>Low</option> <option>Medium</option> <option>High</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          {/* Auto-assign */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="autoAssign" className="text-sm font-medium text-gray-700">Auto-assign Tickets</label>
              <p className="text-xs text-gray-500">Automatically assign new tickets to available staff</p>
            </div>
            <ToggleSwitch id="autoAssign" name="autoAssign" checked={settings.autoAssign} onChange={handleChange} />
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-right">
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </form>
  );
};


// --- Tab "Notifications" ---
const NotificationSettings = () => {
  const [toggles, setToggles] = useState({
    emailNotifications: true,
    newTicketAlert: true,
    ticketAssignedAlert: true,
    ticketStatusChangeAlert: true,
    ticketCommentAlert: false,
    dailyDigest: true,
    weeklyReport: true,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setToggles(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Notification Settings:", toggles);
    alert("Notification Settings Saved!");
  };

  const settingsList = [
    { name: "emailNotifications", title: "Email Notifications", desc: "Enable email notifications for all events" },
    { name: "newTicketAlert", title: "New Ticket Alert", desc: "Notify when a new ticket is created" },
    { name: "ticketAssignedAlert", title: "Ticket Assigned Alert", desc: "Notify when a ticket is assigned to you" },
    { name: "ticketStatusChangeAlert", title: "Ticket Status Change Alert", desc: "Notify when ticket status changes" },
    { name: "ticketCommentAlert", title: "Ticket Comment Alert", desc: "Notify when a comment is added" },
    { name: "dailyDigest", title: "Daily Digest", desc: "Receive a daily summary of ticket activity" },
    { name: "weeklyReport", title: "Weekly Report", desc: "Receive a weekly analytics report" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-800">Notification Settings</h2>
        <p className="text-gray-500 mt-1">Manage email and system notifications</p>
        <div className="mt-6 divide-y">
          {settingsList.map(item => (
            <div key={item.name} className="flex items-center justify-between py-4">
              <div>
                <label htmlFor={item.name} className="text-sm font-medium text-gray-700">{item.title}</label>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
              <ToggleSwitch id={item.name} name={item.name} checked={toggles[item.name]} onChange={handleChange} />
            </div>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-right">
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </form>
  );
};


// --- Tab "Priorities" ---
const PrioritySettings = () => {
  const [priorities, setPriorities] = useState([
    { id: 1, name: "Low", responseTime: "48 hours", enabled: true, tag: "Low" },
    { id: 2, name: "Medium", responseTime: "24 hours", enabled: true, tag: "Medium" },
    { id: 3, name: "High", responseTime: "8 hours", enabled: true, tag: "High" },
  ]);

  const handleChange = (id, field, value) => {
    setPriorities(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };
  
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this priority level?")) {
      setPriorities(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddPriority = () => {
    const newId = priorities.length > 0 ? Math.max(...priorities.map(p => p.id)) + 1 : 1;
    setPriorities(prev => [...prev, { id: newId, name: "New Priority", responseTime: "72 hours", enabled: false, tag: "New" }]);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Priorities:", priorities);
    alert("Priorities Saved!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">Priority Levels</h2>
            <p className="text-gray-500 mt-1">Manage ticket priority levels and SLA response times</p>
          </div>
          <button type="button" onClick={handleAddPriority} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-3 sm:mt-0">
            <Plus size={18} className="mr-2" />
            Add Priority
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          {priorities.map(p => (
            <div key={p.id} className="border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left Side: Name & Tag */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-500">Priority name</label>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => handleChange(p.id, 'name', e.target.value)}
                    className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-shrink-0 pt-5 hidden sm:block">
                  <PriorityTag priority={p.tag} />
                </div>
                
                {/* Right Side: Enable, Response Time, Delete */}
                <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-4 pt-2 sm:pt-0">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-medium text-gray-500 sm:invisible">Enable</label>
                    <ToggleSwitch id={`p_enable_${p.id}`} name="enabled" checked={p.enabled} onChange={(e) => handleChange(p.id, 'enabled', e.target.checked)} label="Enable" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500">Response Time</label>
                    <input
                      type="text"
                      value={p.responseTime}
                      onChange={(e) => handleChange(p.id, 'responseTime', e.target.value)}
                      className="mt-1 w-full sm:w-28 bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-shrink-0 pt-5">
                    <button type="button" onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Save Button */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-right">
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </form>
  );
};


// --- (4) (ใหม่) Tab "Security" ---
const SecuritySettings = () => {
  const [settings, setSettings] = useState({
    minLength: "8 characters",
    requireUpper: true,
    requireLower: false,
    requireNumbers: true,
    requireSpecial: false,
    sessionTimeout: "15 minutes",
    maxLoginAttempts: "5 attempts",
    twoFactorAuth: true,
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saving Security Settings:", settings);
    alert("Security Settings Saved!");
  };

  const passwordPolicies = [
    { name: "requireUpper", title: "Require Uppercase Letters" },
    { name: "requireLower", title: "Require Lowercase Letters" },
    { name: "requireNumbers", title: "Require Numbers" },
    { name: "requireSpecial", title: "Require Special Characters" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {/* Section 1: Password Policy */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-800">Password Policy</h2>
        <p className="text-gray-500 mt-1">Configure password requirements</p>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="minLength" className="block text-sm font-medium text-gray-700">Minimum Password Length</label>
            <input type="text" id="minLength" name="minLength"
              className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.minLength} onChange={handleChange}
            />
          </div>
          {passwordPolicies.map(item => (
            <div key={item.name} className="flex items-center justify-between">
              <label htmlFor={item.name} className="text-sm font-medium text-gray-700">{item.title}</label>
              <ToggleSwitch id={item.name} name={item.name} checked={settings[item.name]} onChange={handleChange} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Divider */}
      <hr className="my-6" />

      {/* Section 2: Session & Auth */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-slate-800">Session & Authentication</h2>
        <p className="text-gray-500 mt-1">Configure session and login security</p>
        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700">Session Timeout</label>
            <input type="text" id="sessionTimeout" name="sessionTimeout"
              className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.sessionTimeout} onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="maxLoginAttempts" className="block text-sm font-medium text-gray-700">Maximum Login Attempts</label>
            <input type="text" id="maxLoginAttempts" name="maxLoginAttempts"
              className="mt-1 w-full bg-gray-100 border border-transparent rounded-lg px-4 py-3 text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={settings.maxLoginAttempts} onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="twoFactorAuth" className="text-sm font-medium text-gray-700">Two Factor Authentication</label>
            <ToggleSwitch id="twoFactorAuth" name="twoFactorAuth" checked={settings.twoFactorAuth} onChange={handleChange} />
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="bg-gray-50 px-6 py-4 rounded-b-lg text-right">
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </form>
  );
};


// --- Component "SystemSettings" ---
export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("General");
  const tabs = ["General", "Notifications", "Priorities", "Security"];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
        <p className="text-gray-500">Configure system-wide settings and preferences</p>
      </div>

      {/* ---  แถบ TABS  --- */}
      <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
        <nav className="flex p-1 space-x-1">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-5 text-sm font-semibold rounded-lg whitespace-nowrap
                ${activeTab === tab
                  ? 'bg-blue-100 text-blue-700' // Active Tab
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' // Inactive Tab
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* --- ส่วนเนื้อหา (Content)  --- */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'General' && (
          <GeneralSettings />
        )}
        {activeTab === 'Notifications' && (
          <NotificationSettings />
        )}
        {activeTab === 'Priorities' && (
          <PrioritySettings />
        )}
        {activeTab === 'Security' && (
          <SecuritySettings />
        )}
      </div>
    </>
  );
}