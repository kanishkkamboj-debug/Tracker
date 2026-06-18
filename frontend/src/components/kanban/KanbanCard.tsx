import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import Card from '@/components/ui/Card';

interface KanbanCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onMove?: (id: number, status: TaskStatus) => void;
}

const PRIORITY_COLORS = {
  LOW: 'bg-status-todo/10 text-status-todo border-status-todo/20',
  MEDIUM: 'bg-status-in_progress/10 text-status-in_progress border-status-in_progress/20',
  HIGH: 'bg-priority-high/10 text-priority-high border-priority-high/20',
  CRITICAL: 'bg-status-critical/10 text-status-critical border-status-critical/20',
};

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'DONE', label: 'Done' },
];

export default function KanbanCard({ task, onDelete, onMove }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none ${isDragging ? 'z-50 opacity-50 scale-95' : ''}`}
    >
      <Card hover className="p-4 group cursor-grab active:cursor-grabbing relative bg-bg-surface">
        <div className="flex justify-between items-start mb-2">
          {/* Drag handle */}
          <div className="flex-1" {...attributes} {...listeners} tabIndex={0} aria-label={`Drag task ${task.title}`}>
            <h4 className="font-medium text-text text-sm leading-snug pr-6">{task.title}</h4>
          </div>
          
          {/* Menu Dropdown - Accessible by keyboard */}
          <div className="relative group/menu flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 -mt-1 -mr-1 text-text-muted hover:text-text rounded opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent outline-none transition-opacity"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-bg-surface border border-border rounded-lg shadow-card hidden group-hover/menu:block focus-within:block z-10 w-40 overflow-hidden">
              {onMove && (
                <div className="border-b border-border py-1">
                  <div className="px-3 py-1 text-xs font-semibold text-text-muted">Move to...</div>
                  {STATUS_OPTIONS.map(opt => opt.id !== task.status && (
                    <button
                      key={opt.id}
                      onClick={() => onMove(task.id, opt.id)}
                      className="w-full text-left px-4 py-1.5 text-sm text-text hover:bg-bg-surface2 flex items-center justify-between focus-visible:bg-bg-surface2 outline-none"
                    >
                      {opt.label} <ArrowRight className="w-3 h-3 text-text-muted" />
                    </button>
                  ))}
                </div>
              )}
              <div className="py-1">
                <button
                  onClick={() => onDelete(task.id)}
                  className="w-full text-left px-4 py-1.5 text-sm text-status-critical hover:bg-status-critical/10 flex items-center focus-visible:bg-status-critical/10 outline-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <div {...attributes} {...listeners} className="flex-1">
          <p className="text-xs text-text-muted line-clamp-2 mb-4">
            {task.description || 'No description provided.'}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
