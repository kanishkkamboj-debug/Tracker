import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center glass-panel rounded-3xl border border-white/10 max-w-2xl mx-auto mt-10 relative overflow-hidden shadow-glow"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/20 blur-[80px] pointer-events-none" />

      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-purple/20 border border-white/20 flex items-center justify-center mb-8 shadow-glow-sm"
      >
        <Inbox className="w-12 h-12 text-accent drop-shadow-[0_0_8px_currentColor]" />
      </motion.div>

      <h3 className="text-3xl font-display font-bold text-white mb-4 tracking-tight drop-shadow-md relative z-10">{title}</h3>
      <p className="text-base text-text-muted/80 max-w-md mb-8 leading-relaxed font-medium relative z-10">{description}</p>
      
      {action && <div className="relative z-10">{action}</div>}
    </motion.div>
  );
}
