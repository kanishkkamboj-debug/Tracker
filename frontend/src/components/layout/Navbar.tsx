import { useLocation } from 'react-router-dom';
import ThemeToggle from '@/components/ui/ThemeToggle';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
};

export default function Navbar() {
  const { pathname } = useLocation();

  const title = pathname.startsWith('/projects/')
    ? 'Project Board'
    : (pageNames[pathname] ?? 'TrackFlow');

  return (
    <header className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-8 flex-shrink-0 relative z-10 shadow-sm">
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
      <h1 className="font-display font-bold text-xl text-white tracking-wide">{title}</h1>
      <ThemeToggle />
    </header>
  );
}
