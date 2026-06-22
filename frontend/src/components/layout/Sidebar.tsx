import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { 
  LayoutDashboard, 
  Folder, 
  ClipboardList, 
  Layout, 
  Users, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  LogOut,
  GitMerge
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: Folder },
  { to: '/tasks',     label: 'Tasks',     icon: ClipboardList },
  { to: '/kanban',    label: 'Kanban',    icon: Layout },
  { to: '/members',   label: 'Members',   icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="w-[260px] flex-shrink-0 bg-surface border-r border-border flex flex-col z-20 h-full overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 mb-2">
        <div className="w-8 h-8 rounded-md bg-[#A5C0F3] flex items-center justify-center shrink-0">
          <span className="text-black font-bold text-sm tracking-tighter">TF</span>
        </div>
        <div className="flex flex-col">
          <span className="font-serif font-bold text-2xl text-white tracking-wide leading-none">TrackFlow</span>
          <span className="text-[10px] font-medium text-text-muted mt-1 uppercase tracking-widest">Productivity Suite</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-surface-3 text-white font-medium'
                    : 'text-text-muted hover:text-white hover:bg-surface-2'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
                <span className="text-sm">{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 space-y-1 border-t border-border mt-auto">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-md text-text-muted hover:text-white hover:bg-surface-2 transition-colors w-full text-left">
          <HelpCircle className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm">Help</span>
        </button>
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-text-muted hover:text-white hover:bg-surface-2 transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}
