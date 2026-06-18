import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderOpen, Calendar, Layers, Pencil, Trash2 } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import type { Project, ProjectRequest, ProjectStatus } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { ProjectStatusBadge } from '@/components/ui/Badge';

// ─── Project Form ─────────────────────────────────────────────────────────────
interface ProjectFormProps {
  initial?: Partial<ProjectRequest>;
  onSubmit: (data: ProjectRequest) => Promise<void>;
  submitLabel: string;
}

function ProjectForm({ initial, onSubmit, submitLabel }: ProjectFormProps) {
  const [name, setName]         = useState(initial?.name ?? '');
  const [desc, setDesc]         = useState(initial?.description ?? '');
  const [status, setStatus]     = useState<ProjectStatus>(initial?.status ?? 'ACTIVE');
  const [startDate, setStart]   = useState(initial?.startDate ?? '');
  const [endDate, setEnd]       = useState(initial?.endDate ?? '');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name, description: desc, status, startDate: startDate || null, endDate: endDate || null });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error saving project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}
      <Input label="Project name" id="proj-name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Website Redesign" />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-muted">Description</label>
        <textarea
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-text bg-bg-surface2 border border-border focus:border-accent outline-none resize-none placeholder:text-text-dim"
          rows={3}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="What is this project about?"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-muted">Status</label>
        <select
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-text bg-bg-surface2 border border-border focus:border-accent outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        >
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Start date" id="proj-start" type="date" value={startDate} onChange={(e) => setStart(e.target.value)} />
        <Input label="End date"   id="proj-end"   type="date" value={endDate}   onChange={(e) => setEnd(e.target.value)} />
      </div>
      <Button type="submit" loading={loading} className="w-full">{submitLabel}</Button>
    </form>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.35 } }),
  exit:   { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

interface ProjectCardProps {
  project: Project;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, index, onEdit, onDelete }: ProjectCardProps) {
  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      whileHover={{ y: -3 }}
      className="bg-bg-surface border border-border rounded-card p-5 shadow-card group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <Link
          to={`/projects/${project.id}`}
          className="font-semibold text-text hover:text-accent transition-colors line-clamp-2 leading-snug"
        >
          {project.name}
        </Link>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit}   className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-bg-surface2 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {project.description && (
        <p className="text-xs text-text-muted line-clamp-2 mb-3">{project.description}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <ProjectStatusBadge status={project.status} />
        <span className="flex items-center gap-1 text-xs text-text-muted">
          <Layers className="w-3 h-3" />{project.taskCount} task{project.taskCount !== 1 ? 's' : ''}
        </span>
        {project.endDate && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="w-3 h-3" />{new Date(project.endDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ─── Projects Page ────────────────────────────────────────────────────────────
export default function ProjectsPage() {
  const [projects, setProjects]   = useState<Project[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(0);
  const [loading, setLoading]     = useState(true);
  const [createOpen, setCreate]   = useState(false);
  const [editProject, setEdit]    = useState<Project | null>(null);
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const PAGE_SIZE = 20;

  const load = (p = 0) => {
    setLoading(true);
    projectsApi.list(p, PAGE_SIZE)
      .then(({ data }) => {
        setProjects(data.data.content);
        setTotal(data.data.totalElements);
        setPage(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(0); }, []);

  const handleCreate = async (req: ProjectRequest) => {
    const { data } = await projectsApi.create(req);
    setProjects((prev) => [data.data, ...prev]);
    setCreate(false);
  };

  const handleEdit = async (req: ProjectRequest) => {
    if (!editProject) return;
    const { data } = await projectsApi.update(editProject.id, req);
    setProjects((prev) => prev.map((p) => (p.id === editProject.id ? data.data : p)));
    setEdit(null);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    await projectsApi.delete(deleteId);
    setProjects((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-3xl text-text">Projects</h2>
          <p className="text-text-muted text-sm mt-1">{total} project{total !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={() => setCreate(true)}>
          <Plus className="w-4 h-4" />New Project
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center"><Spinner size="lg" /></div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <FolderOpen className="w-16 h-16 text-text-dim mb-4" />
          <h3 className="font-semibold text-xl text-text mb-2">No projects yet</h3>
          <p className="text-text-muted mb-6">Create your first project to get started</p>
          <Button onClick={() => setCreate(true)}><Plus className="w-4 h-4" />New Project</Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onEdit={() => setEdit(project)}
                onDelete={() => setDeleteId(project.id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreate(false)} title="New Project">
        <ProjectForm onSubmit={handleCreate} submitLabel="Create Project" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editProject} onClose={() => setEdit(null)} title="Edit Project">
        {editProject && (
          <ProjectForm
            initial={{ ...editProject, startDate: editProject.startDate ?? '', endDate: editProject.endDate ?? '' }}
            onSubmit={handleEdit}
            submitLabel="Save Changes"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Project" width="max-w-sm">
        <p className="text-text-muted mb-6">This will permanently delete the project and all its tasks. This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
