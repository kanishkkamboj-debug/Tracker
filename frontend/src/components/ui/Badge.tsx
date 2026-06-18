import type { TaskPriority, TaskStatus, ProjectStatus } from '@/types';

// ─── Task Status Badge ────────────────────────────────────────────────────────
const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  TODO:        { label: 'To Do',       className: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  REVIEW:      { label: 'Review',      className: 'bg-violet-500/15 text-violet-400 border-violet-500/20' },
  DONE:        { label: 'Done',        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = statusConfig[status] ?? { label: status, className: '' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
const priorityConfig: Record<TaskPriority, { label: string; className: string; dot: string }> = {
  LOW:      { label: 'Low',      className: 'text-slate-400',  dot: 'bg-slate-400'  },
  MEDIUM:   { label: 'Medium',   className: 'text-amber-400',  dot: 'bg-amber-400'  },
  HIGH:     { label: 'High',     className: 'text-orange-400', dot: 'bg-orange-400' },
  CRITICAL: { label: 'Critical', className: 'text-red-400',    dot: 'bg-red-400'    },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const { label, className, dot } = priorityConfig[priority] ?? { label: priority, className: '', dot: '' };
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

// ─── Project Status Badge ─────────────────────────────────────────────────────
const projectStatusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  ON_HOLD:   { label: 'On Hold',   className: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { label, className } = projectStatusConfig[status] ?? { label: status, className: '' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      {label}
    </span>
  );
}
