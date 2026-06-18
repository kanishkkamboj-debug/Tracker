import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import type { Project, Task, TaskRequest, TaskStatus, TaskPriority } from '@/types';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import KanbanCard from '@/components/kanban/KanbanCard';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Spinner from '@/components/ui/Spinner';
import { ProjectStatusBadge } from '@/components/ui/Badge';

const COLUMN_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

// ─── Task Form ────────────────────────────────────────────────────────────────
interface TaskFormProps {
  projectId: number;
  initial?: Partial<Task>;
  onSubmit: (data: TaskRequest) => Promise<void>;
  submitLabel: string;
}

function TaskForm({ projectId, initial, onSubmit, submitLabel }: TaskFormProps) {
  const [title,        setTitle]    = useState(initial?.title ?? '');
  const [desc,         setDesc]     = useState(initial?.description ?? '');
  const [priority,     setPriority] = useState<TaskPriority>(initial?.priority ?? 'MEDIUM');
  const [status,       setStatus]   = useState<TaskStatus>(initial?.status ?? 'TODO');
  const [dueDate,      setDue]      = useState(initial?.dueDate ?? '');
  const [assigneeName, setAssignee] = useState(initial?.assigneeName ?? '');
  const [loading,      setLoading]  = useState(false);
  const [error,        setError]    = useState('');

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        title, description: desc, priority, status,
        dueDate: dueDate || null, assigneeName: assigneeName || null, projectId,
      });
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}
      <Input label="Task title" id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="What needs to be done?" />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-text-muted">Description</label>
        <textarea
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-text bg-bg-surface2 border border-border focus:border-accent outline-none resize-none placeholder:text-text-dim"
          rows={2}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Optional details..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-muted">Priority</label>
          <select className="w-full px-3.5 py-2.5 rounded-xl text-sm text-text bg-bg-surface2 border border-border focus:border-accent outline-none"
            value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-text-muted">Status</label>
          <select className="w-full px-3.5 py-2.5 rounded-xl text-sm text-text bg-bg-surface2 border border-border focus:border-accent outline-none"
            value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Assignee name" id="task-assignee" value={assigneeName} onChange={(e) => setAssignee(e.target.value)} placeholder="e.g. Jane Smith" />
        <Input label="Due date"      id="task-due"      type="date" value={dueDate} onChange={(e) => setDue(e.target.value)} />
      </div>
      <Button type="submit" loading={loading} className="w-full">{submitLabel}</Button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const [project, setProject]     = useState<Project | null>(null);
  const [tasks, setTasks]         = useState<Task[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTask, setActive]   = useState<Task | null>(null);
  const [createOpen, setCreate]   = useState(false);
  const [editTask, setEditTask]   = useState<Task | null>(null);
  const [deleteTask, setDelete]   = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    Promise.all([
      projectsApi.get(projectId),
      projectsApi.getTasks(projectId),
    ]).then(([{ data: p }, { data: t }]) => {
      setProject(p.data);
      setTasks(t.data);
    }).finally(() => setLoading(false));
  }, [projectId]);

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

  // ─── Drag ──────────────────────────────────────────────────────────────────
  const handleDragStart = ({ active }: DragStartEvent) => {
    setActive(tasks.find((t) => String(t.id) === active.id) ?? null);
  };

  const handleDragEnd = useCallback(async ({ active, over }: DragEndEvent) => {
    setActive(null);
    if (!over) return;

    const taskId = Number(active.id);
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      const { data } = await tasksApi.updateStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => t.id === taskId ? data.data : t));
    } catch {
      // Rollback on failure
      setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: task.status } : t));
    }
  }, [tasks]);

  const handleCreate = async (req: TaskRequest) => {
    const { data } = await tasksApi.create(req);
    setTasks((prev) => [data.data, ...prev]);
    setCreate(false);
  };

  const handleEdit = async (req: TaskRequest) => {
    if (!editTask) return;
    const { data } = await tasksApi.update(editTask.id, req);
    setTasks((prev) => prev.map((t) => t.id === editTask.id ? data.data : t));
    setEditTask(null);
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    await tasksApi.delete(deleteTask.id);
    setTasks((prev) => prev.filter((t) => t.id !== deleteTask.id));
    setDelete(null);
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>
  );

  if (!project) return (
    <div className="text-center py-20 text-text-muted">Project not found</div>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <Link to="/projects" className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors">
          <ArrowLeft className="w-4 h-4" />Back
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display font-bold text-2xl text-text truncate">{project.name}</h2>
            <ProjectStatusBadge status={project.status} />
          </div>
          {project.description && (
            <p className="text-sm text-text-muted mt-0.5 line-clamp-1">{project.description}</p>
          )}
        </div>
        <Button onClick={() => setCreate(true)} size="sm">
          <Plus className="w-3.5 h-3.5" />Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {COLUMN_ORDER.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              onEdit={setEditTask}
              onDelete={setDelete}
            />
          ))}
        </div>

        {/* Drag Overlay — ghost card while dragging */}
        <DragOverlay dropAnimation={{
          duration: 220,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask && (
            <KanbanCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          )}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <Modal isOpen={createOpen} onClose={() => setCreate(false)} title="New Task" width="max-w-xl">
        <TaskForm projectId={projectId} onSubmit={handleCreate} submitLabel="Create Task" />
      </Modal>

      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" width="max-w-xl">
        {editTask && (
          <TaskForm projectId={projectId} initial={editTask} onSubmit={handleEdit} submitLabel="Save Changes" />
        )}
      </Modal>

      <Modal isOpen={!!deleteTask} onClose={() => setDelete(null)} title="Delete Task" width="max-w-sm">
        <p className="text-text-muted mb-6">Delete "<span className="text-text font-medium">{deleteTask?.title}</span>"? This cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDelete(null)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
