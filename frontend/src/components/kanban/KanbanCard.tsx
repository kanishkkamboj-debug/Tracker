import { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Calendar, ChevronsUp, Trash2, ArrowRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task, TaskStatus } from '@/types';

interface KanbanCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onMove?: (id: number, status: TaskStatus) => void;
}

const PRIORITY_STYLES = {
  LOW:      'text-slate-400',
  MEDIUM:   'text-blue-400',
  HIGH:     'text-orange-400',
  CRITICAL: 'text-red-400',
};

const STATUS_MOVES: { label: string; value: TaskStatus }[] = [
  { label: 'To Do',       value: 'TODO' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Review',      value: 'REVIEW' },
  { label: 'Done',        value: 'DONE' },
];

export default function KanbanCard({ task, onDelete, onMove }: KanbanCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const taskId = `TASK-${task.id}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none pb-3 ${isDragging ? 'z-50 opacity-40' : ''}`}
    >
      <div className="p-4 cursor-grab active:cursor-grabbing bg-surface/30 backdrop-blur-md border border-border/50 rounded-xl hover:border-accent/50 hover:shadow-[0_0_20px_rgba(165,192,243,0.15)] transition-all duration-300 flex flex-col gap-3 shadow-lg group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Top Row */}
        <div className="flex justify-between items-center" {...attributes} {...listeners}>
          <span className="text-[10px] font-bold text-text-muted bg-surface-2 px-2 py-0.5 rounded uppercase tracking-wider">
            {taskId}
          </span>
          <div className={`flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase ${PRIORITY_STYLES[task.priority]}`}>
            <ChevronsUp className="w-3 h-3" />
            {task.priority}
          </div>
        </div>

        {/* Title */}
        <h4
          className="font-bold text-white text-sm leading-snug cursor-pointer hover:text-accent transition-colors"
          onClick={() => navigate(`/tasks/${task.id}`)}
          {...{ onPointerDown: (e: React.PointerEvent) => e.stopPropagation() }}
        >
          {task.title}
        </h4>

        {/* Project label */}
        {task.projectName && (
          <span className="text-[10px] font-medium text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded self-start">
            {task.projectName}
          </span>
        )}

        {/* Bottom Row */}
        <div className="flex justify-between items-center mt-1 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar className="w-3.5 h-3.5" />
            <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No due date'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-surface-3 flex items-center justify-center text-[10px] font-bold text-white border border-border">
              {task.assigneeName ? task.assigneeName[0].toUpperCase() : '?'}
            </div>

            {/* Context menu */}
            <div className="relative" ref={menuRef}>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
                className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:text-white hover:bg-surface-2 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 bottom-8 z-50 min-w-[160px] bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white hover:bg-surface-2 transition-colors"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`); setMenuOpen(false); }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-text-muted" /> View Details
                  </button>

                  <div className="border-t border-border my-1" />
                  <p className="px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">Move to</p>
                  {STATUS_MOVES.filter((s) => s.value !== task.status).map((s) => (
                    <button
                      key={s.value}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white hover:bg-surface-2 transition-colors"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); onMove?.(task.id, s.value); setMenuOpen(false); }}
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-text-muted" /> {s.label}
                    </button>
                  ))}

                  <div className="border-t border-border my-1" />
                  <button
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); onDelete(task.id); setMenuOpen(false); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
