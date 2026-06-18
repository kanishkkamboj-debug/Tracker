import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Calendar, User } from 'lucide-react';
import type { Task } from '@/types';
import { PriorityBadge } from '@/components/ui/Badge';

interface KanbanCardProps {
  task: Task;
  onEdit:   (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function KanbanCard({ task, onEdit, onDelete }: KanbanCardProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: String(task.id) });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      layoutId={`task-${task.id}`}
      animate={isDragging
        ? { scale: 1.04, boxShadow: '0 12px 40px rgba(0,0,0,0.5)', rotate: 1 }
        : { scale: 1,    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',    rotate: 0 }
      }
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="bg-bg-surface2 border border-border rounded-xl p-3.5 group cursor-grab active:cursor-grabbing select-none"
      {...attributes}
      {...listeners}
    >
      {/* Priority + Actions */}
      <div className="flex items-center justify-between mb-2">
        <PriorityBadge priority={task.priority} />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 rounded-md text-text-muted hover:text-text hover:bg-bg-surface transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Title */}
      <p className="text-sm font-medium text-text leading-snug mb-2">{task.title}</p>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-text-muted line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 flex-wrap mt-1">
        {task.assigneeName && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <User className="w-3 h-3" />{task.assigneeName}
          </span>
        )}
        {task.dueDate && (
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <Calendar className="w-3 h-3" />{new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
}
