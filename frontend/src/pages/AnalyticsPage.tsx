import { useState, useEffect } from 'react';
import { Download, Activity, CalendarDays, ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Button from '@/components/ui/Button';
import { dashboardApi } from '@/api/dashboard';
import { projectsApi } from '@/api/projects';
import type { DashboardSummary, Project } from '@/types';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  TODO: '#94a3b8',
  IN_PROGRESS: '#A5C0F3',
  REVIEW: '#f59e0b',
  DONE: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#94a3b8',
  MEDIUM: '#A5C0F3',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [summaryRes, projectsRes] = await Promise.all([
        dashboardApi.getSummary(selectedProjectId),
        projectsApi.getAll()
      ]);
      setSummary(summaryRes.data.data);
      setProjects(projectsRes.data.data.content || []);
    } catch {
      toast('Failed to load analytics', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleExport = () => {
    if (!summary) return;
    const rows = [
      ['Metric', 'Value'],
      ['Total Projects', summary.totalProjects],
      ['Active Projects', summary.activeProjects],
      ['Total Tasks', summary.totalTasks],
      ['Completed Tasks', summary.completedTasks],
      ['Pending Tasks', summary.pendingTasks],
      [''],
      ['Status', 'Count'],
      ...Object.entries(summary.tasksByStatus),
      [''],
      ['Priority', 'Count'],
      ...Object.entries(summary.tasksByPriority),
    ];

    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackflow_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported as CSV', 'success');
  };

  if (isLoading && !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-muted pb-20">
        <Activity className="w-8 h-8 animate-pulse text-accent mb-4" />
        Loading analytics...
      </div>
    );
  }

  if (!summary) return null;

  const completionRate = summary.totalTasks > 0 
    ? Math.round((summary.completedTasks / summary.totalTasks) * 100) 
    : 0;
  
  const blockersCount = summary.tasksByPriority?.CRITICAL || 0;

  // Prepare Chart Data
  const priorityData = Object.entries(summary.tasksByPriority || {}).map(([name, value]) => ({
    name, value, color: PRIORITY_COLORS[name] || '#64748b'
  }));

  const statusData = Object.entries(summary.tasksByStatus || {}).map(([name, value]) => ({
    name, value, color: STATUS_COLORS[name] || '#64748b'
  }));

  return (
    <div className="max-w-[1400px] mx-auto p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Analytics</h1>
          <p className="text-text-muted mt-2">Real-time performance metrics and team velocity.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProjectId || ''}
            onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-[#0B1120] border border-border rounded-md px-3 py-2 text-sm font-medium text-white focus:outline-none focus:border-accent"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <div className="flex bg-[#0B1120] border border-border rounded-md px-3 py-2 cursor-pointer text-sm font-medium text-text-muted hover:text-white pointer-events-none opacity-50">
            Last 30 Days <ChevronDown className="w-4 h-4 ml-2" />
          </div>
          <Button onClick={handleExport} className="bg-[#A5C0F3] text-black hover:bg-[#93C5FD] font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Completion Rate</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">{completionRate}%</span>
            <span className="flex items-center text-xs font-bold text-emerald-400 mb-1">
              <CheckCircle2 className="w-3 h-3 mr-1" />
            </span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Active Tasks</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">{summary.pendingTasks}</span>
            <span className="flex items-center text-xs font-bold text-accent mb-1">
              <Clock className="w-3 h-3 mr-1" /> Pending
            </span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Total Tasks</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">{summary.totalTasks}</span>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Critical (Blockers)</h3>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-white leading-none">{blockersCount}</span>
            {blockersCount > 0 ? (
              <span className="flex items-center text-xs font-bold text-red-400 mb-1">
                <AlertCircle className="w-3 h-3 mr-1" /> Needs attention
              </span>
            ) : (
              <span className="flex items-center text-xs font-bold text-emerald-400 mb-1">
                All clear
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Task Priority Distribution</h2>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131B2F', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#A5C0F3' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Task Status Breakdown</h2>
          </div>
          <div className="flex-1 min-h-[300px] w-full relative">
            {statusData.reduce((a, b) => a + b.value, 0) > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#131B2F', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                No tasks available to display
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
