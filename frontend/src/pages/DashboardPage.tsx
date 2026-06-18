import { useState, useEffect } from 'react';
import { dashboardApi } from '@/api/dashboard';
import { DashboardSummary } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, LayoutDashboard, FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';

// ─── 3D Tilt Card Component ────────────────────────────────────────────────────
function TiltCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [5, -5]);
  const rotateY = useTransform(x, [-100, 100], [-5, 5]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={`glass-panel relative overflow-hidden group ${className}`}
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </motion.div>
  );
}

// ─── Animated Number Component ─────────────────────────────────────────────────
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
  const user = useAuthStore((s) => s.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Futuristic Palette
  const COLORS = ['#00f2fe', '#f093fb', '#4facfe', '#ff0844'];

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
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        <div>
          <Skeleton variant="text" className="w-48 h-12 mb-2" />
          <Skeleton variant="text" className="w-64 h-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5">
              <Skeleton className="w-12 h-12 rounded-xl mb-4 bg-white/5" />
              <Skeleton variant="text" className="w-1/2 h-8 mb-2 bg-white/5" />
              <Skeleton variant="text" className="w-3/4 h-4 bg-white/5" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 h-[400px] rounded-2xl border border-white/5">
             <Skeleton className="w-full h-full rounded-lg bg-white/5" />
          </div>
          <div className="glass-panel p-6 h-[400px] rounded-2xl border border-white/5">
             <Skeleton className="w-full h-full rounded-lg bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  const tasksByStatus = summary?.tasksByStatus || {};
  const statusData = [
    { name: 'TODO', value: tasksByStatus.TODO || 0 },
    { name: 'IN PROGRESS', value: tasksByStatus.IN_PROGRESS || 0 },
    { name: 'REVIEW', value: tasksByStatus.REVIEW || 0 },
    { name: 'DONE', value: tasksByStatus.DONE || 0 },
  ].filter(d => d.value > 0);

  const tasksByPriority = summary?.tasksByPriority || {};
  const priorityData = [
    { name: 'LOW', value: tasksByPriority.LOW || 0 },
    { name: 'MEDIUM', value: tasksByPriority.MEDIUM || 0 },
    { name: 'HIGH', value: tasksByPriority.HIGH || 0 },
    { name: 'CRITICAL', value: tasksByPriority.CRITICAL || 0 },
  ].filter(d => d.value > 0);

  const stats = [
    { label: 'Active Projects', value: summary?.totalProjects || 0, icon: LayoutDashboard, color: 'text-accent', bg: 'bg-accent/10 border border-accent/20' },
    { label: 'Total Tasks', value: summary?.totalTasks || 0, icon: Clock, color: 'text-accent-purple', bg: 'bg-accent-purple/10 border border-accent-purple/20' },
    { label: 'Completed Tasks', value: tasksByStatus.DONE || 0, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border border-emerald-400/20' },
    { label: 'Critical Tasks', value: tasksByPriority.CRITICAL || 0, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10 border border-red-400/20' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-display font-bold tracking-tight text-white drop-shadow-sm">Dashboard</h1>
        <p className="text-lg text-text-muted font-medium">Welcome back, {user?.name?.split(' ')[0] || 'User'}. Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <TiltCard className="p-6 rounded-2xl flex items-center gap-5 cursor-pointer hover:border-white/10 transition-colors">
              <div className={`p-4 rounded-2xl shadow-glow-sm flex-shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="relative z-10 flex-1 min-w-0">
                <p className="text-xs font-bold tracking-wider uppercase text-text-muted mb-1 truncate">{stat.label}</p>
                <p className="text-3xl font-display font-bold text-white drop-shadow-md">
                  <AnimatedNumber value={stat.value} />
                </p>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

      {!summary || summary.totalProjects === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <TiltCard className="p-16 rounded-3xl mt-8 flex flex-col items-center justify-center text-center border border-white/5 bg-gradient-to-b from-white/5 to-transparent">
            <div className="w-24 h-24 bg-accent-purple/10 border border-accent-purple/20 rounded-3xl flex items-center justify-center mb-8 shadow-glow">
              <FolderKanban className="w-12 h-12 text-accent-purple drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">No Active Projects</h2>
            <p className="text-text-muted max-w-lg mb-10 text-lg leading-relaxed">
              Your workspace is looking a little empty. Create your first project board to start tracking tasks, managing priorities, and visualizing your progress.
            </p>
            <Button onClick={() => navigate('/projects')} className="px-8 py-3.5 text-base font-bold shadow-glow-sm hover:shadow-glow transition-all">
              Create Your First Project
            </Button>
          </TiltCard>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Charts Grid */}
          {/* Status Pie Chart */}
          <TiltCard className="p-8 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_currentColor]" /> Tasks by Status
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} 
                    itemStyle={{ color: '#fff' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {statusData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                  <div className="w-3 h-3 rounded-full shadow-glow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-semibold text-text-muted">{entry.name}</span>
                </div>
              ))}
            </div>
          </TiltCard>

          {/* Priority Bar Chart */}
          <TiltCard className="p-8 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-pink animate-pulse shadow-[0_0_8px_currentColor]" /> Tasks by Priority
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                    contentStyle={{ backgroundColor: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(12px)' }} 
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TiltCard>
        </div>
      )}
    </motion.div>
  );
}
