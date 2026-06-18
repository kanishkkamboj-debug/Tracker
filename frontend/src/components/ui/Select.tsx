import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-text">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={`
              w-full bg-bg-surface border rounded-xl px-4 py-2.5 text-text text-sm
              transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg
              appearance-none
              ${error 
                ? 'border-status-critical focus-visible:ring-status-critical text-status-critical' 
                : 'border-border focus-visible:ring-accent focus-visible:border-accent hover:border-accent/50'
              }
              ${className}
            `}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Custom Chevron since we used appearance-none */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-muted">
            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center px-2">
              <AlertCircle className="w-4 h-4 text-status-critical" aria-hidden="true" />
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs text-status-critical font-medium" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
