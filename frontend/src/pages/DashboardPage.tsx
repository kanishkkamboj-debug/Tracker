import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { dashboardApi } from '@/api/dashboard';
import type { DashboardSummary, Task } from '@/types';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { FolderKanban, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Animated number count-up ─────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v).toString(); },
    });
    return controls.stop;
  }, [value]);
  return <span ref={ref}>0</span>;
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="bg-bg-surface border border-border rounded-card p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </div>
      <div className="font-display font-bold text-4xl text-text">
        <AnimatedNumber value={value} />
      </div>
    </motion.div>
  );
}

// ─── Colors ───────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  TODO: '#64748b', IN_PROGRESS: '#f59e0b', REVIEW: '#8b5cf6', DONE: '#10b981',
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: '#64748b', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
};
const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do', IN_PROGRESS: 'In Progress', REVIEW: 'Review', DONE: 'Done',
};

const CustomTooltip = ({ active, payload, label }: any) =>
  active && payload?.length ? (
    <div className="bg-bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text shadow-card">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.fill ?? p.color }}>{p.name ?? p.dataKey}: {p.value}</p>
      ))}
    </div>
  ) : null;

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    dashboardApi.getSummary()
      .then(({ data }) => setSummary(data.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  if (error || !summary) return (
    <div className="text-center py-20 text-text-muted">{error || 'No data'}</div>
  );

  const statusChartData = Object.entries(summary.tasksByStatus).map(([key, val]) => ({
    name: STATUS_LABELS[key] ?? key, value: val, fill: STATUS_COLORS[key],
  }));

  const priorityChartData = Object.entries(summary.tasksByPriority).map(([key, val]) => ({
    name: key.charAt(0) + key.slice(1).toLowerCase(), value: val, fill: PRIORITY_COLORS[key],
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-3xl text-text">Overview</h2>
        <p className="text-text-muted text-sm mt-1">Your project health at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={summary.totalProjects}
          icon={<FolderKanban className="w-4 h-4 text-accent" />}
          color="bg-accent/10"
          delay={0}
        />
        <StatCard
          title="Active Projects"
          value={summary.activeProjects}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          color="bg-amber-500/10"
          delay={0.08}
        />
        <StatCard
          title="Completed Tasks"
          value={summary.completedTasks}
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          color="bg-emerald-500/10"
          delay={0.16}
        />
        <StatCard
          title="Pending Tasks"
          value={summary.pendingTasks}
          icon={<Clock className="w-4 h-4 text-violet-400" />}
          color="bg-violet-500/10"
          delay={0.24}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Status — Pie */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-surface border border-border rounded-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-text mb-4">Tasks by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive
                animationDuration={800}
              >
                {statusChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-xs text-text-muted">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Tasks by Priority — Bar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-bg-surface border border-border rounded-card p-6 shadow-card"
        >
          <h3 className="font-semibold text-text mb-4">Tasks by Priority</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={priorityChartData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={800}>
                {priorityChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-bg-surface border border-border rounded-card shadow-card overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-text">Recent Tasks</h3>
        </div>
        {summary.recentTasks.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-sm">No tasks yet</div>
        ) : (
          <ul>
            {summary.recentTasks.map((task, i) => (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-bg-surface2 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/projects/${task.projectId}`}
                    className="text-sm font-medium text-text hover:text-accent transition-colors truncate block"
                  >
                    {task.title}
                  </Link>
                  <span className="text-xs text-text-muted">{task.projectName}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
