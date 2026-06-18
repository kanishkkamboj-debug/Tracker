import { InputHTMLAttributes, forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-muted">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={`
              w-full px-3.5 py-2.5 rounded-xl text-sm text-text
              bg-bg-surface2 border transition-colors outline-none
              placeholder:text-text-dim
              ${error
                ? 'border-red-500/50 focus:border-red-500'
                : 'border-border focus:border-accent'}
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
              <AlertCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400" role="alert">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-muted">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
