import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react';
import { tasksApi } from '@/api/tasks';
import { projectsApi } from '@/api/projects';
import { Task, TaskStatus, TaskPriority, Project } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import GlobalCreateTaskModal from '@/components/kanban/GlobalCreateTaskModal';
import Button from '@/components/ui/Button';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  TODO:        { label: 'To Do',       icon: Circle,       color: 'text-text-muted',  bg: 'bg-surface-2' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock,        color: 'text-accent',      bg: 'bg-accent/10' },
  REVIEW:      { label: 'Review',      icon: AlertCircle,  color: 'text-amber-400',   bg: 'bg-amber-400/10' },
  DONE:        { label: 'Done',        icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  LOW:      { label: 'Low',      color: 'text-slate-400' },
  MEDIUM:   { label: 'Medium',   color: 'text-blue-400'  },
  HIGH:     { label: 'High',     color: 'text-orange-400' },
  CRITICAL: { label: 'Critical', color: 'text-red-400'   },
};

export default function TasksPage() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'ALL'>('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const projRes = await projectsApi.list(0, 100);
        const allProjects = projRes.data.data.content;
        setProjects(allProjects);

        // Fetch tasks from all projects
        const taskArrays = await Promise.all(
          allProjects.map((p) => projectsApi.getTasks(p.id).then((r) => r.data.data))
        );
        setTasks(taskArrays.flat());
      } catch {
        toast('Failed to load tasks', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  const loadTasks = async () => {
    try {
      const projRes = await projectsApi.list(0, 100);
      const allProjects = projRes.data.data.content;
      const taskArrays = await Promise.all(
        allProjects.map((p) => projectsApi.getTasks(p.id).then((r) => r.data.data))
      );
      setTasks(taskArrays.flat());
    } catch {
      // Handle error implicitly
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await tasksApi.delete(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      toast('Task deleted', 'success');
    } catch {
      toast('Failed to delete task', 'error');
    }
  };

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                        t.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Tasks</h1>
          <p className="text-text-muted mt-1">All tasks across your projects</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <span className="bg-surface-2 border border-border px-3 py-1.5 rounded-md font-medium">
            {filtered.length} task{filtered.length !== 1 ? 's' : ''}
          </span>
          <Button onClick={() => setIsTaskModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-md text-white text-sm placeholder-text-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-surface border border-border rounded-md text-white text-sm px-3 py-2 focus:outline-none focus:border-accent"
        >
          <option value="ALL">All Statuses</option>
          {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          className="bg-surface border border-border rounded-md text-white text-sm px-3 py-2 focus:outline-none focus:border-accent"
        >
          <option value="ALL">All Priorities</option>
          {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
          ))}
        </select>
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted">
          <CheckCircle2 className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm mt-1 opacity-60">Create tasks from your project pages</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const S = STATUS_CONFIG[task.status];
            const P = PRIORITY_CONFIG[task.priority];
            const StatusIcon = S.icon;
            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:border-text-muted/40 hover:bg-surface-2 transition-all group"
              >
                {/* Status icon */}
                <StatusIcon className={`w-5 h-5 flex-shrink-0 ${S.color}`} />

                {/* Title & project */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate group-hover:text-accent transition-colors">{task.title}</p>
                  <p className="text-text-muted text-xs mt-0.5 truncate">{task.projectName}</p>
                </div>

                {/* Status pill */}
                <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${S.bg} ${S.color}`}>
                  {S.label}
                </span>

                {/* Priority */}
                <span className={`hidden md:inline text-xs font-bold uppercase tracking-wider ${P.color}`}>
                  {P.label}
                </span>

                {/* Assignee */}
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-bold text-accent flex-shrink-0">
                  {task.assigneeName ? task.assigneeName[0].toUpperCase() : '?'}
                </div>

                {/* Due date */}
                {task.dueDate && (
                  <span className="hidden lg:inline text-xs text-text-muted whitespace-nowrap">
                    {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      <GlobalCreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onTaskCreated={loadTasks}
      />
    </div>
  );
}
