import { useState, useEffect } from 'react';
import { dashboardApi } from '@/api/dashboard';
import { DashboardSummary } from '@/types';
import Card from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const duration = 1000;
    const incrementTime = 30;
    const steps = duration / incrementTime;
    const stepValue = end / steps;
    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, incrementTime);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function DashboardPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
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
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Skeleton variant="text" className="w-48 h-10 mb-2" />
          <Skeleton variant="text" className="w-64 h-5" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="w-12 h-12 rounded-xl mb-4" />
              <Skeleton variant="text" className="w-1/2 h-8 mb-2" />
              <Skeleton variant="text" className="w-3/4 h-4" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 h-[400px]">
             <Skeleton className="w-full h-full rounded-lg" />
          </Card>
          <Card className="p-6 h-[400px]">
             <Skeleton className="w-full h-full rounded-lg" />
          </Card>
        </div>
      </div>
    );
  }

  if (!summary || summary.totalProjects === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <EmptyState
          title="Welcome to your Dashboard"
          description="It looks like you don't have any projects yet. Head over to the Projects page to create your first board and start tracking tasks!"
          action={<Button onClick={() => navigate('/projects')}>Go to Projects</Button>}
        />
      </div>
    );
  }

  const statusData = [
    { name: 'TODO', value: summary.tasksByStatus.TODO || 0 },
    { name: 'IN PROGRESS', value: summary.tasksByStatus.IN_PROGRESS || 0 },
    { name: 'REVIEW', value: summary.tasksByStatus.REVIEW || 0 },
    { name: 'DONE', value: summary.tasksByStatus.DONE || 0 },
  ].filter(d => d.value > 0);

  const priorityData = [
    { name: 'LOW', value: summary.tasksByPriority.LOW || 0 },
    { name: 'MEDIUM', value: summary.tasksByPriority.MEDIUM || 0 },
    { name: 'HIGH', value: summary.tasksByPriority.HIGH || 0 },
    { name: 'CRITICAL', value: summary.tasksByPriority.CRITICAL || 0 },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Total Projects', value: summary.totalProjects, icon: LayoutDashboard, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Tasks', value: summary.totalTasks, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed Tasks', value: summary.tasksByStatus.DONE || 0, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Critical Priority', value: summary.tasksByPriority.CRITICAL || 0, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-text">Dashboard</h1>
        <p className="text-text-muted mt-1">Here's what's happening across your projects</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6 flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-text">
                  <AnimatedNumber value={stat.value} />
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Pie Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-6">Tasks by Status</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text)' }} itemStyle={{ color: 'var(--color-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-text-muted">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Bar Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text mb-6">Tasks by Priority</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)' }} />
                <Tooltip cursor={{ fill: 'var(--color-surface-2)' }} contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text)' }} />
                <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
