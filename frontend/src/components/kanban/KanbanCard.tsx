import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { motion } from 'framer-motion';

interface KanbanCardProps {
  task: Task;
  onDelete: (id: number) => void;
  onMove?: (id: number, status: TaskStatus) => void;
}

const PRIORITY_COLORS = {
  LOW: 'bg-white/5 text-slate-300 border-white/10',
  MEDIUM: 'bg-accent/20 text-accent border-accent/30 shadow-[0_0_10px_rgba(0,242,254,0.2)]',
  HIGH: 'bg-accent-pink/20 text-accent-pink border-accent-pink/30 shadow-[0_0_10px_rgba(240,147,251,0.2)]',
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-pulse',
};

const STATUS_OPTIONS: { id: TaskStatus; label: string }[] = [
  { id: 'TODO', label: 'To Do' },
  { id: 'IN_PROGRESS', label: 'In Progress' },
  { id: 'REVIEW', label: 'Review' },
  { id: 'DONE', label: 'Done' },
];

export default function KanbanCard({ task, onDelete, onMove }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: task.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`touch-none ${isDragging ? 'z-50 opacity-80 scale-105 rotate-2 kanban-card-dragging' : ''}`}
    >
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        className="p-5 group cursor-grab active:cursor-grabbing relative glass-panel rounded-xl border border-white/10 hover:border-accent/50 hover:shadow-glow-sm transition-all duration-300 overflow-hidden"
      >
        {/* Subtle glass reflection */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

        <div className="flex justify-between items-start mb-3 relative z-10">
          {/* Drag handle */}
          <div className="flex-1 outline-none" {...attributes} {...listeners} tabIndex={0} aria-label={`Drag task ${task.title}`}>
            <h4 className="font-bold text-white text-base leading-snug pr-6 tracking-wide drop-shadow-sm">{task.title}</h4>
          </div>
          
          {/* Menu Dropdown */}
          <div className="relative group/menu flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 -mt-1 -mr-1 text-text-muted hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border border-transparent hover:border-white/10"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-card hidden group-hover/menu:block focus-within:block z-20 w-44 overflow-hidden">
              {onMove && (
                <div className="border-b border-white/10 py-1">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-text-muted/70">Move to</div>
                  {STATUS_OPTIONS.map(opt => opt.id !== task.status && (
                    <button
                      key={opt.id}
                      onClick={() => onMove(task.id, opt.id)}
                      className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 flex items-center justify-between transition-colors outline-none"
                    >
                      {opt.label} <ArrowRight className="w-3 h-3 opacity-50" />
                    </button>
                  ))}
                </div>
              )}
              <div className="py-1">
                <button
                  onClick={() => onDelete(task.id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 flex items-center transition-colors font-medium outline-none"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>

        <div {...attributes} {...listeners} className="flex-1 relative z-10 outline-none">
          <p className="text-xs text-text-muted/80 line-clamp-2 mb-5 leading-relaxed font-medium">
            {task.description || 'No description provided.'}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-widest ${PRIORITY_COLORS[task.priority]}`}>
              {task.priority}
            </span>
            <div className="flex -space-x-2 relative z-0">
               {/* Decorative avatars for 'FAANG' feel */}
               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent-purple border border-white/20 shadow-glow-sm" />
               <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink border border-white/20 shadow-glow-sm" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
