import { useState, useEffect } from 'react';
import { dashboardApi } from '@/api/dashboard';
import { DashboardSummary } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Folder, ClipboardList, TrendingUp, MoreHorizontal, MessageSquare, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await dashboardApi.getSummary();
        setSummary(res.data.data);
      } catch (error) {
        toast('Failed to load dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [toast]);

  if (isLoading) {
    return <div className="p-8">Loading...</div>; // Simplified for brevity
  }

  // Mock data for the specific charts in the screenshot
  const barData = [
    { name: 'Mon', value: 30 },
    { name: 'Tue', value: 45 },
    { name: 'Wed', value: 25 },
    { name: 'Thu', value: 60 },
    { name: 'Fri', value: 40 },
    { name: 'Sat', value: 70 },
    { name: 'Sun', value: 35 },
  ];

  const donutData = [
    { name: 'On Track', value: 65, color: '#A5C0F3' },
    { name: 'At Risk', value: 20, color: '#10B981' },
    { name: 'Off Track', value: 15, color: '#F87171' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-text-muted mt-2">Welcome back. Here's what's happening across your workspace.</p>
        </div>
        <Button className="bg-[#A5C0F3] text-black hover:bg-[#93C5FD] font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Total Projects</span>
            <Folder className="w-5 h-5 text-text-muted" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">24</div>
          <div className="flex items-center text-xs font-medium text-emerald-400">
            <TrendingUp className="w-3 h-3 mr-1" /> +3 this month
          </div>
        </div>

        {/* Total Tasks */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Total Tasks</span>
            <ClipboardList className="w-5 h-5 text-text-muted" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">186</div>
          <div className="flex items-center text-xs font-medium text-emerald-400">
            <TrendingUp className="w-3 h-3 mr-1" /> +12 this week
          </div>
        </div>

        {/* Completed */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Completed</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">142</div>
          <div className="text-xs font-medium text-text-muted">
            76% completion rate
          </div>
        </div>

        {/* Overdue */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Overdue</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-4xl font-bold text-red-400 mb-2">7</div>
          <div className="text-xs font-medium text-red-400">
            Requires attention
          </div>
        </div>
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-semibold text-white">Task Completion (Last 7 Days)</h2>
            <MoreHorizontal className="w-5 h-5 text-text-muted cursor-pointer" />
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#A5C0F3" radius={0} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-panel p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Project Health</h2>
          <div className="flex-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={0} dataKey="value" stroke="none">
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-white">65%</span>
              <span className="text-xs text-text-muted">On Track</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {donutData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-muted">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Activity */}
      <div className="glass-panel">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <button className="text-xs font-bold text-text-muted hover:text-white uppercase tracking-wider">View All</button>
        </div>
        <div className="p-6 space-y-6">
          
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-white">Sarah Jenkins</span> completed task <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs ml-1 mr-1">DB-104</span> Update user authentication flow
              </p>
              <p className="text-xs text-text-dim mt-1">2 hours ago • Project Alpha</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-white">Mike Ross</span> commented on <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs ml-1 mr-1">UI-892</span> Dashboard layout adjustments
              </p>
              <p className="text-sm text-text-muted italic border-l-2 border-white/10 pl-3 mt-2">
                "I think we should use a bento grid for the main metrics."
              </p>
              <p className="text-xs text-text-dim mt-2">4 hours ago • UI Redesign</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-white">You</span> created a new project <span className="text-[#A5C0F3] font-medium ml-1">Q4 Marketing Campaign</span>
              </p>
              <p className="text-xs text-text-dim mt-1">Yesterday</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
