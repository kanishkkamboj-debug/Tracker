import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  if (hover) {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring' as const, stiffness: 300 }}
        className={`bg-bg-surface border border-border rounded-card shadow-card ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
  return (
    <div className={`bg-bg-surface border border-border rounded-card shadow-card ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
