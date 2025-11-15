import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement, // สำหรับ Donut
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2"; // import กราฟ 3 แบบ
import {
  ChevronDown,
  Ticket,
  ClipboardList,
  CheckCircle,
  XCircle,
} from "lucide-react";

// (สำคัญ) ลงทะเบียน Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- (จำลอง) API Call ---
// คุณต้องแก้ส่วนนี้ให้เรียก API จริงจาก Backend ของคุณ
const fetchReportData = async (period) => {
  console.log(`Fetching data for: ${period}`);
  // จำลองการดึงข้อมูล
  return {
    stats: {
      totalTickets: 6,
      totalChange: "+12%",
      openTickets: 2,
      openSubtitle: "Needs attention",
      resolved: 1,
      resolvedChange: "+8%",
      closed: 1,
      closedSubtitle: "Completed",
    },
    statusChart: {
      labels: ["Open", "In Progress", "Resolved", "Closed"],
      data: [2, 2, 1, 1],
      colors: ["#3b82f6", "#f59e0b", "#22c55e", "#6b7280"],
    },
    priorityChart: {
      labels: ["Critical", "High", "Medium", "Low"],
      data: [1, 2, 2, 1],
    },
    timeChart: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      data: [5, 4, 6, 3, 5, 6, 4],
    },
  };
};
// --- จบ (จำลอง) API Call ---

// --- (ใหม่) Component กราฟ Status (สำหรับจอมือถือ) ---
const StatusChartMobileView = ({ data, colors, labels }) => {
  const total = data.reduce((acc, val) => acc + val, 0);
  const percentages = data.map(val => ((val / total) * 100).toFixed(0));

  return (
    <div className="space-y-3">
      {labels.map((label, index) => (
        <div key={label}>
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{label}</span>
            <span className="font-medium text-slate-700">{percentages[index]}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ width: `${percentages[index]}%`, backgroundColor: colors[index] }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};


export default function ReportAdmin() {
  const [stats, setStats] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [priorityData, setPriorityData] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("Last 7 days");

  // --- ดึงข้อมูลตอนเริ่ม (และเมื่อ Filter เปลี่ยน) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchReportData(timeFilter);
        setStats(data.stats);
        
        // Data สำหรับ Donut Chart (Status)
        setStatusData({
          labels: data.statusChart.labels,
          datasets: [{
            data: data.statusChart.data,
            backgroundColor: data.statusChart.colors,
            borderColor: '#ffffff',
            borderWidth: 2,
          }],
        });

        // Data สำหรับ Bar Chart (Priority)
        setPriorityData({
          labels: data.priorityChart.labels,
          datasets: [{
            label: 'Tickets',
            data: data.priorityChart.data,
            backgroundColor: '#3b82f6',
            borderRadius: 6,
          }],
        });

        // Data สำหรับ Line Chart (Over Time)
        setTimeData({
          labels: data.timeChart.labels,
          datasets: [{
            label: 'Tickets',
            data: data.timeChart.data,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.1, // ทำให้เส้นโค้งเล็กน้อย
          }],
        });

      } catch (err) {
        console.error("Failed to load report data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [timeFilter]);

  // --- Options สำหรับ Charts ---
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: true, color: '#f3f4f6' }, beginAtZero: true },
    },
  };
  
  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%', // ทำให้เป็น Donut
    plugins: {
      legend: { 
        display: true, 
        position: 'right', // (ในดีไซน์ Responsive มันถูกซ่อน)
        labels: { boxWidth: 12, padding: 15 }
      },
    },
  };

  if (loading) return <div className="p-8">Loading reports...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  // --- Stat Cards (ดีไซน์ใหม่) ---
  const statCards = [
    { key: "totalTickets", label: "Total Tickets", value: stats?.totalTickets, change: stats?.totalChange, icon: <Ticket size={24} className="text-blue-500" /> },
    { key: "openTickets", label: "Open Tickets", value: stats?.openTickets, change: stats?.openSubtitle, icon: <ClipboardList size={24} className="text-yellow-500" /> },
    { key: "resolved", label: "Resolved", value: stats?.resolved, change: stats?.resolvedChange, icon: <CheckCircle size={24} className="text-green-500" /> },
    { key: "closed", label: "Closed", value: stats?.closed, change: stats?.closedSubtitle, icon: <XCircle size={24} className="text-gray-500" /> },
  ];

  return (
    <>
      {/* Header และ Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Dashboard</h1>
          <p className="text-gray-500">View analytics and ticket statistics</p>
        </div>
        {/* Time Filter */}
        <div className="relative">
          <select
            className="w-full sm:w-auto appearance-none border rounded-lg bg-white px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 90 days">Last 90 days</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Stat Cards (Responsive) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className="bg-gray-100 p-2 rounded-full">{card.icon}</div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{card.value ?? 0}</p>
            <p className={`text-xs ${card.change?.startsWith('+') ? 'text-green-500' : 'text-gray-400'}`}>
              {card.change}
            </p>
          </div>
        ))}
      </div>

      {/* --- (ใหม่) ส่วนของ Charts (Responsive) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Tickets by Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tickets by Status</h2>
          {/* Desktop: Donut Chart */}
          <div className="hidden md:block" style={{ height: '300px' }}>
            {statusData && <Doughnut data={statusData} options={donutOptions} />}
          </div>
          {/* Mobile: Horizontal Bar List (ตามดีไซน์) */}
          <div className="block md:hidden">
            {statusData && (
              <StatusChartMobileView 
                data={statusData.datasets[0].data} 
                colors={statusData.datasets[0].backgroundColor} 
                labels={statusData.labels} 
              />
            )}
          </div>
        </div>

        {/* Chart 2: Tickets by Priority */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tickets by Priority</h2>
          <div style={{ height: '300px' }}>
            {priorityData && <Bar data={priorityData} options={commonOptions} />}
          </div>
        </div>

        {/* Chart 3: Tickets Created Over Time (เต็มความกว้าง) */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Tickets Created Over Time</h2>
          <div style={{ height: '300px' }}>
            {timeData && <Line data={timeData} options={commonOptions} />}
          </div>
        </div>

      </div>
    </>
  );
}