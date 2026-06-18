import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export default function KanbanColumn({ id, title, count, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  // Neon accents based on title/id
  let accentColor = 'bg-accent/20 border-accent/30';
  let glowColor = 'shadow-glow-sm';
  let dotColor = 'bg-accent';
  
  if (id === 'IN_PROGRESS') { 
    accentColor = 'bg-accent-purple/20 border-accent-purple/30'; 
    glowColor = 'shadow-[0_0_15px_rgba(139,92,246,0.3)]'; 
    dotColor = 'bg-accent-purple';
  }
  if (id === 'REVIEW') { 
    accentColor = 'bg-accent-pink/20 border-accent-pink/30'; 
    glowColor = 'shadow-[0_0_15px_rgba(236,72,153,0.3)]'; 
    dotColor = 'bg-accent-pink';
  }
  if (id === 'DONE') { 
    accentColor = 'bg-emerald-400/20 border-emerald-400/30'; 
    glowColor = 'shadow-[0_0_15px_rgba(52,211,153,0.3)]'; 
    dotColor = 'bg-emerald-400';
  }

  return (
    <div className="flex flex-col min-w-[320px] max-w-[350px] flex-1">
      {/* Column Header */}
      <div className={`flex items-center gap-3 mb-4 px-4 py-3 rounded-t-xl border-t-2 ${accentColor} ${glowColor} bg-white/5 backdrop-blur-md`}>
        <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse shadow-[0_0_8px_currentColor]`} />
        <span className="font-bold tracking-wider uppercase text-sm text-white drop-shadow-md">{title}</span>
        <span className="ml-auto bg-black/40 text-white border border-white/10 text-xs px-2.5 py-1 rounded-full font-bold shadow-inner">
          {count}
        </span>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-4 min-h-[150px] rounded-b-2xl rounded-t-sm glass-panel p-3 transition-all duration-300 ${
          isOver ? 'border-accent bg-accent/10 shadow-glow scale-[1.02]' : 'border-white/5'
        }`}
      >
        {children}

        {count === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm font-medium text-text-muted/50 py-10 uppercase tracking-widest border-2 border-dashed border-white/5 rounded-xl m-2">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
