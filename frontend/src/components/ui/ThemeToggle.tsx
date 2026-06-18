import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const icons = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-text-muted hover:text-text hover:bg-bg-surface2 transition-colors focus-visible:ring-2 focus-visible:ring-accent outline-none"
        aria-label="Toggle theme"
      >
        {icons[theme]}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-bg-surface border border-border rounded-xl shadow-card overflow-hidden z-50"
          >
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTheme(t); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus-visible:bg-bg-surface2 outline-none
                  ${theme === t ? 'bg-accent/10 text-accent font-medium' : 'text-text-muted hover:text-text hover:bg-bg-surface2'}
                `}
              >
                {icons[t]}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
