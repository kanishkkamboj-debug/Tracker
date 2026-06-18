import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export default function KanbanColumn({ id, title, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column Header */}
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
        <span className="font-semibold text-sm text-text">{title}</span>
        <span className="ml-auto bg-bg-surface2 text-text-muted text-xs px-2 py-0.5 rounded-full font-medium">
          {count}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2 min-h-[120px] rounded-xl border-2 p-1 transition-colors ${
          isOver ? 'border-accent bg-accent/5' : 'border-dashed border-transparent'
        }`}
      >
        {children}

        {count === 0 && (
          <div className="flex-1 flex items-center justify-center text-xs text-text-muted py-6">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
