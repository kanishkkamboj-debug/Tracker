import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClass = `relative bg-surface/40 backdrop-blur-md border border-border/50 rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden ${className}`;
  
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={`${baseClass} cursor-pointer group`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
  return (
    <div className={baseClass} onClick={onClick}>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
