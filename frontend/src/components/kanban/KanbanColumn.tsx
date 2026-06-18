import { motion } from 'framer-motion';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Task, TaskStatus } from '@/types';
import KanbanCard from './KanbanCard';

const COLUMN_CONFIG: Record<TaskStatus, { label: string; color: string; headerColor: string }> = {
  TODO:        { label: 'To Do',       color: 'border-slate-500/20',   headerColor: 'text-slate-400'  },
  IN_PROGRESS: { label: 'In Progress', color: 'border-amber-500/20',   headerColor: 'text-amber-400'  },
  REVIEW:      { label: 'Review',      color: 'border-violet-500/20',  headerColor: 'text-violet-400' },
  DONE:        { label: 'Done',        color: 'border-emerald-500/20', headerColor: 'text-emerald-400'},
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onEdit:   (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function KanbanColumn({ status, tasks, onEdit, onDelete }: KanbanColumnProps) {
  const { label, color, headerColor } = COLUMN_CONFIG[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = tasks.map((t) => String(t.id));

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column Header */}
      <div className={`flex items-center gap-2 mb-3 pb-3 border-b ${color}`}>
        <span className={`font-semibold text-sm ${headerColor}`}>{label}</span>
        <span className="ml-auto bg-bg-surface2 text-text-muted text-xs px-2 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>
      </div>

      {/* Drop Zone */}
      <motion.div
        ref={setNodeRef}
        animate={{
          backgroundColor: isOver ? 'rgba(99,102,241,0.06)' : 'rgba(0,0,0,0)',
          borderColor: isOver ? 'rgba(99,102,241,0.3)' : 'transparent',
        }}
        transition={{ duration: 0.15 }}
        className="flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl border-2 border-dashed p-1 transition-colors"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-text-dim py-6">
            Drop tasks here
          </div>
        )}
      </motion.div>
    </div>
  );
}
