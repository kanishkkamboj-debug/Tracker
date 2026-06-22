import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Flag, Download, Trash2, FolderOpen, AlertCircle } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { Project, ProjectRequest } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';

const STATUS_STYLES = {
  ACTIVE:    { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20', label: 'Active' },
  ON_HOLD:   { dot: 'bg-amber-400',   text: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20',   label: 'On Hold' },
  COMPLETED: { dot: 'bg-blue-400',    text: 'text-blue-400',    bg: 'bg-blue-400/10 border-blue-400/20',    label: 'Completed' },
};

function calcProgress(project: Project) {
  // Use task count as a rough heuristic; real progress requires completed/total ratio
  // We don't have per-project completion ratio in ProjectResponse, so we estimate via status
  if (project.status === 'COMPLETED') return 100;
  if (project.status === 'ON_HOLD') return 0;
  // ACTIVE: show task-count progress capped at 90%
  return Math.min(90, (project.taskCount || 0) * 5);
}

function fmt(d: string | null | undefined) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      const res = await projectsApi.getAll();
      setProjects(res.data.data.content ?? []);
    } catch {
      toast('Failed to load projects', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ── Create ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    const fd = new FormData(e.currentTarget);
    const payload: ProjectRequest = {
      name:        fd.get('name') as string,
      description: fd.get('description') as string,
      status:      (fd.get('status') as any) || 'ACTIVE',
      startDate:   (fd.get('startDate') as string) || null,
      endDate:     (fd.get('endDate') as string) || null,
    };
    try {
      const res = await projectsApi.create(payload);
      setProjects((prev) => [res.data.data, ...prev]);
      setIsCreateOpen(false);
      toast('Project created!', 'success');
    } catch (err: any) {
      toast(err?.response?.data?.message ?? 'Failed to create project', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(deleteTarget.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast('Project deleted', 'success');
    } catch {
      toast('Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      ['ID', 'Name', 'Status', 'Owner', 'Tasks', 'Start Date', 'End Date', 'Created At'],
      ...projects.map((p) => [
        p.id, p.name, p.status, p.ownerName, p.taskCount,
        p.startDate ?? '', p.endDate ?? '', p.createdAt ?? '',
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackflow_projects_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Exported as CSV', 'success');
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        (p.description ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Projects</h1>
          <p className="text-text-muted mt-1">Manage and track your active initiatives.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              className="pl-9 pr-4 py-2 border border-border rounded-md bg-surface text-white placeholder-text-muted/50 focus:outline-none focus:border-accent sm:text-sm w-56 transition-colors"
              placeholder="Search projects..."
            />
          </div>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface border border-border rounded-md text-white text-sm px-3 py-2 focus:outline-none focus:border-accent"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {/* Export */}
          <Button variant="secondary" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          {/* Create */}
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-text-muted">
          <FolderOpen className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">{search ? 'No projects match your search' : 'No projects yet'}</p>
          <p className="text-sm mt-1 opacity-60">Click "New Project" to create one</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project) => {
            const S = STATUS_STYLES[project.status] ?? STATUS_STYLES.ACTIVE;
            const progress = calcProgress(project);
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="glass-panel p-6 cursor-pointer hover:border-text-muted/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col h-full group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white truncate pr-4 group-hover:text-accent transition-colors">
                    {project.name}
                  </h3>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded border ${S.bg} shrink-0`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${S.dot}`} />
                    <span className={`text-[10px] font-bold ${S.text} tracking-wider`}>{S.label.toUpperCase()}</span>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-text-muted mb-4 line-clamp-2">{project.description}</p>
                )}

                {/* Owner */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                    {project.ownerName ? project.ownerName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm text-text-muted">
                    <span className="text-white font-medium">{project.ownerName || 'Unassigned'}</span>
                  </span>
                  <span className="ml-auto text-xs text-text-muted">{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="mt-auto">
                  {/* Progress */}
                  <div className="flex justify-between text-xs font-medium mb-1.5 text-text-muted">
                    <span>Progress</span>
                    <span className="text-white">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-3 rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center text-xs text-text-muted pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{fmt(project.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5" />
                      <span>{fmt(project.endDate)}</span>
                    </div>
                    {/* Delete (stop propagation) */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                      className="ml-2 p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Project Name" name="name" required placeholder="e.g. Mobile App Redesign" autoFocus />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              name="description"
              className="w-full glass-panel rounded-xl px-4 py-2.5 text-text text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent placeholder:text-text-muted/50"
              rows={3}
              placeholder="What is this project about?"
            />
          </div>
          <Select
            label="Status"
            name="status"
            defaultValue="ACTIVE"
            options={[
              { value: 'ACTIVE',    label: 'Active' },
              { value: 'ON_HOLD',   label: 'On Hold' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text">End Date</label>
              <input
                type="date"
                name="endDate"
                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isCreating}>Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Project">
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-white font-semibold mb-1">Delete "{deleteTarget?.name}"?</p>
            <p className="text-sm text-text-muted">This will permanently delete the project and all its tasks. This cannot be undone.</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" loading={isDeleting} onClick={handleDelete}>
              Delete Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
