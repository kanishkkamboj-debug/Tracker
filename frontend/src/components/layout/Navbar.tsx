import { Search, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-16 bg-bg border-b border-border flex items-center justify-between px-8 flex-shrink-0 z-10">
      
      {/* Left Side (Empty or Page Title) */}
      <div className="flex-1" />

      {/* Right Side */}
      <div className="flex items-center gap-6">
        <button className="text-text-muted hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          {/* Unread dot */}
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-accent ring-2 ring-bg" />
        </button>
        
        {/* Avatar */}
        <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-border transition-colors">
          <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm overflow-hidden border border-border">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase() ?? 'U'
            )}
          </div>
        </button>
      </div>

    </header>
  );
}
