import { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary:   'bg-gradient-to-r from-accent to-[#7B9EED] text-[#0B1120] shadow-[0_0_15px_rgba(165,192,243,0.4)] hover:shadow-[0_0_25px_rgba(165,192,243,0.6)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg border-none font-bold',
  secondary: 'bg-surface-2/60 backdrop-blur-sm hover:bg-surface-3/80 text-text border border-border/50 shadow-lg focus-visible:ring-2 focus-visible:ring-text-muted focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  ghost:     'hover:bg-white/5 backdrop-blur-sm text-text-muted hover:text-text focus-visible:ring-2 focus-visible:ring-text-muted focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  danger:    'bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm hover:from-red-500/30 hover:to-red-600/30 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)] focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || loading ? 1 : 1.03, y: disabled || loading ? 0 : -1 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
      disabled={disabled || loading}
      className={`
        relative inline-flex items-center justify-center gap-2 transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      {...(props as any)}
    >
      {/* Shine effect on hover for primary button */}
      {variant === 'primary' && !disabled && !loading && (
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
          initial={{ x: '-100%' }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </span>
    </motion.button>
  )
);

Button.displayName = 'Button';
export default Button;
