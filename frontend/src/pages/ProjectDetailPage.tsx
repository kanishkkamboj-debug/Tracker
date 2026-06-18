import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { DndContext, DragEndEvent, closestCorners, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { Project, Task, TaskStatus } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/ToastProvider';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import KanbanCard from '@/components/kanban/KanbanCard';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'DONE', title: 'Done' },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drag state
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [projRes, tasksRes] = await Promise.all([
          projectsApi.get(Number(id)),
          projectsApi.getTasks(Number(id)),
        ]);
        setProject(projRes.data.data);
        setTasks(tasksRes.data.data);
      } catch (error) {
        toast('Failed to load project details', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, toast]);

  const handleDragStart = (e: any) => {
    const { active } = e;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    const isOverColumn = COLUMNS.some((c) => c.id === overId);
    let newStatus = activeTask.status;

    if (isOverColumn) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (activeTask.status === newStatus) {
      // Reordering within same column
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        setTasks((prev) => {
          const oldIndex = prev.findIndex((t) => t.id === activeId);
          const newIndex = prev.findIndex((t) => t.id === overId);
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
      return;
    }

    // Moving to new column - Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === activeId ? { ...t, status: newStatus } : t))
    );

    try {
      await tasksApi.updateStatus(activeId, newStatus);
    } catch (error) {
      // Revert on failure
      setTasks(previousTasks);
      toast('Failed to move task. Reverting changes.', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!project) return;
    const formData = new FormData(e.currentTarget);
    try {
      const res = await tasksApi.create({
        projectId: project.id,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        priority: (formData.get('priority') as any) || 'MEDIUM',
        status: 'TODO',
        dueDate: null,
        assigneeName: null,
      });
      setTasks([...tasks, res.data.data]);
      setIsCreateOpen(false);
      setShowAdvanced(false);
      toast('Task created', 'success');
    } catch (error) {
      toast('Failed to create task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(tasks.filter((t) => t.id !== taskId));
      toast('Task deleted', 'success');
    } catch (error) {
      toast('Failed to delete task', 'error');
    }
  };

  const handleMoveTask = async (taskId: number, newStatus: TaskStatus) => {
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      toast('Task moved', 'success');
    } catch (error) {
      setTasks(previousTasks);
      toast('Failed to move task. Reverting changes.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col max-w-[1600px] mx-auto pb-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div>
              <Skeleton variant="text" className="w-48 h-8 mb-2" />
              <Skeleton variant="text" className="w-64 h-4" />
            </div>
          </div>
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
        <div className="flex-1 flex gap-6 overflow-hidden">
          {COLUMNS.map((col) => (
            <div key={col.id} className="w-[350px] shrink-0 bg-bg-surface2 rounded-2xl p-4 flex flex-col gap-4">
              <Skeleton variant="text" className="w-24 h-6 mb-2" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-32 rounded-xl" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="h-[calc(100vh-64px-48px)] flex flex-col max-w-[1600px] mx-auto pb-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 -ml-2 text-text-muted hover:text-text rounded-xl hover:bg-bg-surface2 transition-colors focus-visible:ring-2 focus-visible:ring-accent outline-none"
            aria-label="Back to projects"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-display font-bold text-text">{project.name}</h1>
            <p className="text-text-muted mt-1">{project.description}</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-2 min-h-[500px]">
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max pb-4">
            {COLUMNS.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.id);
              return (
                <KanbanColumn key={col.id} id={col.id} title={col.title} count={columnTasks.length}>
                  <SortableContext items={columnTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    {columnTasks.map((task) => (
                      <KanbanCard key={task.id} task={task} onDelete={handleDeleteTask} onMove={handleMoveTask} />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              );
            })}
          </div>

          <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.8', scale: '1.05', rotate: '2deg' } } }) }}>
            {activeTask ? <KanbanCard task={activeTask} onDelete={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input label="Task Title" name="title" required placeholder="e.g. Design Landing Page" autoFocus />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea
              name="description"
              className="w-full glass-panel rounded-xl px-4 py-2.5 text-text text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent placeholder:text-text-muted/50"
              rows={3}
              placeholder="Add more details to this task..."
            />
          </div>

          {!showAdvanced ? (
            <button
              type="button"
              onClick={() => setShowAdvanced(true)}
              className="text-sm text-accent hover:text-accent-hover font-medium outline-none focus-visible:underline"
            >
              + Add Priority
            </button>
          ) : (
            <div className="animate-fade-in">
              <Select
                label="Priority"
                name="priority"
                defaultValue="MEDIUM"
                options={[
                  { value: 'LOW', label: 'Low' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'HIGH', label: 'High' },
                  { value: 'CRITICAL', label: 'Critical' },
                ]}
              />
            </div>
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
