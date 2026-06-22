import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Share2, MoreHorizontal, AlertCircle, ChevronRight, Pencil, Trash2, Check, X } from 'lucide-react';
import { tasksApi } from '@/api/tasks';
import { Task, TaskStatus, TaskPriority } from '@/types';
import Button from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; border: string; dot: string }> = {
  TODO:        { label: 'To Do',       color: 'text-slate-400',   border: 'border-slate-400/30',   dot: 'bg-slate-400' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-accent',      border: 'border-accent/30',      dot: 'bg-accent' },
  REVIEW:      { label: 'Review',      color: 'text-amber-400',   border: 'border-amber-400/30',   dot: 'bg-amber-400' },
  DONE:        { label: 'Done',        color: 'text-emerald-400', border: 'border-emerald-400/30', dot: 'bg-emerald-400' },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; border: string; icon: string }> = {
  LOW:      { label: 'Low',      color: 'text-slate-400',   border: 'border-slate-400/30',   icon: '↓' },
  MEDIUM:   { label: 'Medium',   color: 'text-blue-400',    border: 'border-blue-400/30',    icon: '→' },
  HIGH:     { label: 'High',     color: 'text-orange-400',  border: 'border-orange-400/30',  icon: '↑' },
  CRITICAL: { label: 'Critical', color: 'text-red-400',     border: 'border-red-400/30',     icon: '⚡' },
};

function fmt(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Inline status change
  const [editStatus, setEditStatus] = useState<TaskStatus>('TODO');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await tasksApi.get(Number(id));
        setTask(res.data.data);
        setEditStatus(res.data.data.status);
      } catch {
        toast('Failed to load task', 'error');
        navigate('/tasks');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate, toast]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!task) return;
    const prev = task.status;
    setTask({ ...task, status: newStatus });
    setEditStatus(newStatus);
    try {
      await tasksApi.updateStatus(task.id, newStatus);
      toast('Status updated', 'success');
    } catch {
      setTask({ ...task, status: prev });
      setEditStatus(prev);
      toast('Failed to update status', 'error');
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!task) return;
    setIsSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await tasksApi.update(task.id, {
        projectId:    task.projectId,
        title:        fd.get('title') as string,
        description:  fd.get('description') as string,
        priority:     fd.get('priority') as TaskPriority,
        status:       task.status,
        dueDate:      (fd.get('dueDate') as string) || null,
        assigneeName: (fd.get('assigneeName') as string) || null,
      });
      setTask(res.data.data);
      setIsEditOpen(false);
      toast('Task updated', 'success');
    } catch {
      toast('Failed to update task', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await tasksApi.delete(task.id);
      toast('Task deleted', 'success');
      navigate(-1);
    } catch {
      toast('Failed to delete task', 'error');
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast('Link copied to clipboard!', 'success');
  };

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto p-8 space-y-6">
        <Skeleton className="w-64 h-5" />
        <Skeleton className="w-full h-12" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <Skeleton className="w-full h-48 rounded-xl" />
            <Skeleton className="w-full h-32 rounded-xl" />
          </div>
          <Skeleton className="w-full h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!task) return null;

  const S = STATUS_CONFIG[task.status] ?? STATUS_CONFIG.TODO;
  const P = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.MEDIUM;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-sm text-text-muted font-medium gap-1">
          <Link to="/projects" className="hover:text-white transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/projects/${task.projectId}`} className="hover:text-white transition-colors">
            {task.projectName}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white font-bold">TASK-{task.id}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleShare} className="border border-border text-sm gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button variant="ghost" onClick={() => setIsEditOpen(true)} className="border border-border text-sm gap-2">
            <Pencil className="w-4 h-4" /> Edit
          </Button>
          <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm gap-2">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Title & Badges */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight mb-4">{task.title}</h1>
        <div className="flex items-center flex-wrap gap-3">
          {/* Status badge (clickable to cycle) */}
          <div className="relative group">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded border ${S.border} ${S.color} text-xs font-bold uppercase tracking-wider bg-current/10 cursor-pointer`}
              style={{ background: undefined }}>
              <div className={`w-1.5 h-1.5 rounded-full ${S.dot}`} />
              {S.label}
            </div>
            {/* Status dropdown */}
            <div className="hidden group-hover:flex absolute top-full left-0 mt-1 z-10 flex-col bg-surface border border-border rounded-xl shadow-xl overflow-hidden min-w-[140px]">
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
                const C = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs hover:bg-surface-2 transition-colors ${task.status === s ? 'bg-surface-2 font-bold' : ''} ${C.color}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${C.dot}`} />
                    {C.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded border ${P.border} ${P.color} text-xs font-bold uppercase tracking-wider`}>
            <AlertCircle className="w-3 h-3" />
            {P.label}
          </div>

          {/* Project tag */}
          <Link
            to={`/projects/${task.projectId}`}
            className="px-3 py-1 rounded text-text-muted text-xs font-bold uppercase tracking-wider bg-surface-3 hover:text-white hover:bg-surface-2 transition-colors"
          >
            {task.projectName}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Description */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-text-muted">📄</span> Description
            </h3>
            {task.description ? (
              <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{task.description}</p>
            ) : (
              <p className="text-sm text-text-muted/40 italic">No description yet. Click Edit to add one.</p>
            )}
          </div>
        </div>

        {/* Right Column – Details */}
        <div className="space-y-6">
          <div className="glass-panel">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-white">Details</h3>
            </div>
            <div className="p-4 space-y-4">
              <DetailRow label="👤 Assignee">
                <span className="text-white font-medium flex items-center gap-2">
                  {task.assigneeName ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                        {task.assigneeName[0].toUpperCase()}
                      </div>
                      {task.assigneeName}
                    </>
                  ) : (
                    <span className="text-text-muted/50">Unassigned</span>
                  )}
                </span>
              </DetailRow>

              <div className="w-full h-px bg-border/50" />

              <DetailRow label="📅 Due Date">
                <span className={`font-medium ${task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-400' : 'text-white'}`}>
                  {fmt(task.dueDate)}
                </span>
              </DetailRow>

              <div className="w-full h-px bg-border/50" />

              <DetailRow label="📁 Project">
                <Link to={`/projects/${task.projectId}`} className="text-accent hover:underline font-medium">
                  {task.projectName}
                </Link>
              </DetailRow>

              <div className="w-full h-px bg-border/50" />

              <DetailRow label="🕒 Created">
                <span className="text-white font-medium">{fmt(task.createdAt)}</span>
              </DetailRow>

              <DetailRow label="🔄 Updated">
                <span className="text-white font-medium">{fmt(task.updatedAt)}</span>
              </DetailRow>
            </div>
          </div>

          {/* Quick Status Change */}
          <div className="glass-panel p-4">
            <h3 className="font-bold text-white text-sm mb-3">Change Status</h3>
            <div className="space-y-2">
              {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => {
                const C = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      task.status === s
                        ? 'bg-surface-2 font-bold ' + C.color
                        : 'text-text-muted hover:bg-surface-2 hover:text-white'
                    }`}
                  >
                    {task.status === s ? <Check className="w-3.5 h-3.5" /> : <div className={`w-2 h-2 rounded-full ${C.dot}`} />}
                    {C.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Task">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="Title" name="title" required defaultValue={task.title} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              name="description"
              defaultValue={task.description ?? ''}
              className="w-full glass-panel rounded-xl px-4 py-2.5 text-text text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent placeholder:text-text-muted/50"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              name="priority"
              defaultValue={task.priority}
              options={[
                { value: 'LOW',      label: 'Low' },
                { value: 'MEDIUM',   label: 'Medium' },
                { value: 'HIGH',     label: 'High' },
                { value: 'CRITICAL', label: 'Critical' },
              ]}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Assignee</label>
              <input
                type="text"
                name="assigneeName"
                defaultValue={task.assigneeName ?? ''}
                placeholder="Enter name"
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Due Date</label>
            <input
              type="date"
              name="dueDate"
              defaultValue={task.dueDate ?? ''}
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Task">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-white font-semibold">Delete "{task.title}"?</p>
          <p className="text-sm text-text-muted">This action cannot be undone.</p>
          <div className="flex gap-3 w-full pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={isDeleting} onClick={handleDelete}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-text-muted">{label}</span>
      {children}
    </div>
  );
}
