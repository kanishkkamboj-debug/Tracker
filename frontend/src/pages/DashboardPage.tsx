import { useState, useEffect } from 'react';
import { dashboardApi } from '@/api/dashboard';
import { DashboardSummary } from '@/types';
import { useToast } from '@/components/ui/ToastProvider';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, Folder, ClipboardList, Clock, MessageSquare, Plus } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import GlobalCreateTaskModal from '@/components/kanban/GlobalCreateTaskModal';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const PROJECT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#A5C0F3',
  COMPLETED: '#10B981',
  ON_HOLD: '#F87171',
};

export default function DashboardPage() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

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

  if (isLoading || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted pb-20">
        <Activity className="w-8 h-8 animate-pulse text-accent mb-4" />
        Loading dashboard...
      </div>
    );
  }

  // Data for Project Health Donut Chart
  const donutData = [
    { name: 'Active', value: summary.activeProjects, color: PROJECT_STATUS_COLORS.ACTIVE },
    { name: 'Completed', value: summary.completedProjects, color: PROJECT_STATUS_COLORS.COMPLETED },
    { name: 'On Hold', value: summary.onHoldProjects, color: PROJECT_STATUS_COLORS.ON_HOLD },
  ].filter(d => d.value > 0);

  const totalDonut = donutData.reduce((acc, d) => acc + d.value, 0);

  // Data for Task Priority Bar Chart
  const barData = Object.entries(summary.tasksByPriority || {}).map(([name, value]) => ({
    name, value
  }));

  const completionRate = summary.totalTasks > 0 
    ? Math.round((summary.completedTasks / summary.totalTasks) * 100) 
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-text-muted mt-2">Welcome back{user?.name ? `, ${user.name}` : ''}. Here's what's happening across your workspace.</p>
        </div>
        <Button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-[#A5C0F3] text-black hover:bg-[#93C5FD] font-semibold flex items-center gap-2"
        >
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
          <div className="text-4xl font-bold text-white mb-2">{summary.totalProjects}</div>
          <div className="flex items-center text-xs font-medium text-accent">
            <Clock className="w-3 h-3 mr-1" /> {summary.activeProjects} active
          </div>
        </div>

        {/* Total Tasks */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Total Tasks</span>
            <ClipboardList className="w-5 h-5 text-text-muted" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">{summary.totalTasks}</div>
          <div className="flex items-center text-xs font-medium text-text-muted">
            Across all projects
          </div>
        </div>

        {/* Completed */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Completed Tasks</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-4xl font-bold text-white mb-2">{summary.completedTasks}</div>
          <div className="text-xs font-medium text-text-muted">
            {completionRate}% completion rate
          </div>
        </div>

        {/* Blockers / Critical */}
        <div className="glass-panel p-5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-text-muted">Critical Tasks</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-4xl font-bold text-red-400 mb-2">{summary.tasksByPriority?.CRITICAL || 0}</div>
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
            <h2 className="text-lg font-semibold text-white">Tasks by Priority</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#A5C0F3" radius={[4, 4, 0, 0]} barSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="glass-panel p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Project Health</h2>
          <div className="flex-1 relative flex items-center justify-center">
            {totalDonut > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{summary.activeProjects}</span>
                  <span className="text-xs text-text-muted">Active</span>
                </div>
              </>
            ) : (
              <div className="text-text-muted text-sm">No projects yet</div>
            )}
          </div>
          <div className="mt-6 space-y-3">
            {donutData.map(item => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-text-muted">{item.name}</span>
                </div>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Recent Activity */}
      <div className="glass-panel">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        <div className="p-6 space-y-6">
          {summary.recentTasks && summary.recentTasks.length > 0 ? (
            summary.recentTasks.map(task => (
              <div key={task.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  task.status === 'DONE' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                }`}>
                  {task.status === 'DONE' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-text-muted">
                    <span className="font-semibold text-white">{task.assigneeName || 'Unassigned'}</span> 
                    {task.status === 'DONE' ? ' completed ' : ' updated '}
                    task 
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs ml-1 mr-1 truncate inline-block max-w-[200px] align-bottom">
                      {task.title}
                    </span>
                  </p>
                  <p className="text-xs text-text-dim mt-1">
                    {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })} • {task.projectName}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-text-muted text-sm text-center py-4">No recent activity.</div>
          )}
        </div>
      </div>

      <GlobalCreateTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => {
          setIsTaskModalOpen(false);
          // Quick reload after creating a task to update stats
          dashboardApi.getSummary().then(res => setSummary(res.data.data)).catch();
        }} 
      />
    </div>
  );
}
