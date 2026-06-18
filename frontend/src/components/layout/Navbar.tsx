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
    <header className="h-16 bg-bg-surface border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <h1 className="font-display font-semibold text-xl text-text">{title}</h1>
      <ThemeToggle />
    </header>
  );
}
