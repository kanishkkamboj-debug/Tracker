import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Plus } from 'lucide-react';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  onAddTask?: () => void;
}

const COLUMN_STYLES: Record<string, { dot: string; border: string }> = {
  TODO:        { dot: 'bg-text-muted',  border: 'border-text-muted/30' },
  IN_PROGRESS: { dot: 'bg-accent',      border: 'border-accent' },
  REVIEW:      { dot: 'bg-amber-400',   border: 'border-amber-400' },
  DONE:        { dot: 'bg-emerald-400', border: 'border-emerald-400' },
};

export default function KanbanColumn({ id, title, count, children, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const styles = COLUMN_STYLES[id] ?? { dot: 'bg-text-muted', border: 'border-transparent' };

  return (
    <div className="flex flex-col min-w-[320px] max-w-[350px] flex-1 h-full">
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col glass-panel border-t-2 rounded-t-sm transition-colors ${styles.border} ${
          isOver ? 'bg-white/5 ring-1 ring-inset ring-white/10' : ''
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center gap-2 p-4 shrink-0">
          <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
          <span className="font-bold tracking-widest uppercase text-sm text-text">{title}</span>
          <span className="bg-surface-3 text-text-muted text-xs px-2 py-0.5 rounded font-bold ml-1">
            {count}
          </span>
          <button className="ml-auto text-text-muted hover:text-white transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Cards area */}
        <div className="flex-1 flex flex-col gap-3 px-3 pb-3 overflow-y-auto">
          {children}

          {count === 0 && (
            <div className="flex-1 flex items-center justify-center text-sm font-medium text-text-muted/40 py-10 border-2 border-dashed border-border/50 rounded-lg m-1">
              Drop cards here
            </div>
          )}

          <button
            onClick={onAddTask}
            className="w-full text-left py-2 px-3 text-sm font-medium text-text-muted hover:text-white hover:bg-surface-2 rounded-md transition-colors flex items-center gap-1.5 mt-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
