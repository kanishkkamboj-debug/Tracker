import { useState, useEffect } from 'react';
import { tasksApi } from '@/api/tasks';
import { projectsApi } from '@/api/projects';
import { Project, TaskPriority } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/ToastProvider';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
  defaultProjectId?: number;
}

export default function GlobalCreateTaskModal({ isOpen, onClose, onTaskCreated, defaultProjectId }: Props) {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchProjects = async () => {
      try {
        const res = await projectsApi.list(0, 100);
        setProjects(res.data.data.content);
      } catch (error) {
        toast('Failed to load projects for selection', 'error');
      }
    };
    fetchProjects();
  }, [isOpen, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    
    try {
      await tasksApi.create({
        projectId: Number(fd.get('projectId')),
        title: fd.get('title') as string,
        description: fd.get('description') as string,
        priority: (fd.get('priority') as TaskPriority) || 'MEDIUM',
        status: 'TODO',
        dueDate: null,
        assigneeName: null,
      });
      toast('Task created successfully', 'success');
      onTaskCreated?.();
      onClose();
    } catch (error) {
      toast('Failed to create task', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          name="projectId"
          required
          defaultValue={defaultProjectId || ''}
          options={[
            { value: '', label: 'Select a project...' },
            ...projects.map(p => ({ value: p.id, label: p.name }))
          ]}
        />
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
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Task'}</Button>
        </div>
      </form>
    </Modal>
  );
}
