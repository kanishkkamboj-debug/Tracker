import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { LayoutDashboard, FolderKanban, LogOut, Zap } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects',  label: 'Projects',  icon: FolderKanban   },
];

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout);
  const user   = useAuthStore((s) => s.user);

  return (
    <aside className="w-64 flex-shrink-0 glass-panel border-r border-white/10 flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-display font-bold text-xl text-white tracking-wide">TrackFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 mt-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-accent-purple/20 text-accent-purple font-semibold'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm tracking-wide">{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-white/10">
        <div className="glass-panel rounded-xl p-3 flex flex-col gap-4 border border-white/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-purple to-accent-pink flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-text-muted/80 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:text-red-400 bg-black/20 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 outline-none"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
