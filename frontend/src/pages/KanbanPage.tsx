import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { DndContext, DragEndEvent, closestCorners, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { Task, TaskStatus, Project } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import KanbanCard from '@/components/kanban/KanbanCard';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO',        title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW',      title: 'Review' },
  { id: 'DONE',        title: 'Done' },
];

export default function KanbanPage() {
  const { toast } = useToast();
  const [tasks,    setTasks]    = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Create task modal
  const [isCreateOpen,  setIsCreateOpen]  = useState(false);
  const [showAdvanced,  setShowAdvanced]  = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | ''>('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const projRes = await projectsApi.list(0, 100);
        const allProjects = projRes.data.data.content;
        setProjects(allProjects);

        const taskArrays = await Promise.all(
          allProjects.map((p) => projectsApi.getTasks(p.id).then((r) => r.data.data))
        );
        setTasks(taskArrays.flat());
      } catch {
        toast('Failed to load board', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [toast]);

  const handleDragStart = (e: any) => {
    const task = tasks.find((t) => t.id === e.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as number;
    const overId   = over.id;
    const current  = tasks.find((t) => t.id === activeId);
    if (!current) return;

    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    let newStatus = current.status;

    if (isOverColumn) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (current.status === newStatus) {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        setTasks((prev) => {
          const oldIdx = prev.findIndex((t) => t.id === activeId);
          const newIdx = prev.findIndex((t) => t.id === overId);
          return arrayMove(prev, oldIdx, newIdx);
        });
      }
      return;
    }

    const prev = [...tasks];
    setTasks((all) => all.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t)));
    try {
      await tasksApi.updateStatus(activeId, newStatus);
    } catch {
      setTasks(prev);
      toast('Failed to move task', 'error');
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

  const handleMove = async (id: number, status: TaskStatus) => {
    const prev = [...tasks];
    setTasks((all) => all.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await tasksApi.updateStatus(id, status);
      toast('Task moved', 'success');
    } catch {
      setTasks(prev);
      toast('Failed to move task', 'error');
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) { toast('Please select a project', 'error'); return; }
    const fd = new FormData(e.currentTarget);
    try {
      const res = await tasksApi.create({
        projectId:    Number(selectedProject),
        title:        fd.get('title') as string,
        description:  fd.get('description') as string,
        priority:     (fd.get('priority') as any) || 'MEDIUM',
        status:       'TODO',
        dueDate:      null,
        assigneeName: null,
      });
      setTasks((prev) => [...prev, res.data.data]);
      setIsCreateOpen(false);
      setShowAdvanced(false);
      toast('Task created', 'success');
    } catch {
      toast('Failed to create task', 'error');
    }
  };

  if (isLoading) return (
    <div className="flex gap-6 h-[calc(100vh-180px)] overflow-x-auto pb-4">
      {COLUMNS.map((c) => (
        <div key={c.id} className="min-w-[320px] bg-surface border border-border rounded-xl p-4">
          <Skeleton variant="text" className="w-24 h-5 mb-4" />
          {[1,2,3].map((i) => <Skeleton key={i} className="w-full h-28 rounded-lg mb-3" />)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Kanban Board</h1>
          <p className="text-text-muted mt-1">Drag & drop tasks across columns</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Task
        </Button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full min-w-max pb-4">
            {COLUMNS.map((col) => {
              const colTasks = tasks.filter((t) => t.status === col.id);
              return (
                <KanbanColumn key={col.id} id={col.id} title={col.title} count={colTasks.length} onAddTask={() => setIsCreateOpen(true)}>
                  <SortableContext items={colTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {colTasks.map((task) => (
                      <KanbanCard key={task.id} task={task} onDelete={handleDelete} onMove={handleMove} />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.8' } } }) }}>
            {activeTask ? <KanbanCard task={activeTask} onDelete={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Task to Board">
        <form onSubmit={handleCreate} className="space-y-4">
          {/* Project selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(Number(e.target.value))}
              required
              className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <Input label="Task Title" name="title" required placeholder="What needs to be done?" autoFocus />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              name="description"
              className="w-full glass-panel rounded-xl px-4 py-2.5 text-text text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent placeholder:text-text-muted/50"
              rows={3}
              placeholder="Add more details..."
            />
          </div>

          {!showAdvanced ? (
            <button type="button" onClick={() => setShowAdvanced(true)} className="text-sm text-accent hover:text-accent-hover font-medium">
              + Add Priority
            </button>
          ) : (
            <Select label="Priority" name="priority" defaultValue="MEDIUM" options={[
              { value: 'LOW',      label: 'Low' },
              { value: 'MEDIUM',   label: 'Medium' },
              { value: 'HIGH',     label: 'High' },
              { value: 'CRITICAL', label: 'Critical' },
            ]} />
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
