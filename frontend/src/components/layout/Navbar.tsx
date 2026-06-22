import { useState, useEffect, useRef } from 'react';
import { Bell, LogOut, User, Settings, HelpCircle, X, Check, CheckCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { notificationsApi, type NotificationItem } from '@/api/notifications';

export default function Navbar() {
  const navigate = useNavigate();
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const settings = useSettingsStore((s) => s.settings);

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [notifs,     setNotifs]     = useState<NotificationItem[]>([]);
  const [unread,     setUnread]     = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // ── User menu ─────────────────────────────────────────────────────────────
  const [userOpen,  setUserOpen]  = useState(false);
  const userRef  = useRef<HTMLDivElement>(null);

  // ── Help modal ─────────────────────────────────────────────────────────────
  const [helpOpen,  setHelpOpen]  = useState(false);

  // Load notifications
  const loadNotifs = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationsApi.getAll(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifs(listRes.data.data ?? []);
      setUnread(countRes.data.data ?? 0);
    } catch {
      // Silently fail — notifications are non-critical
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 30_000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsApi.markRead(id);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, readStatus: true } : n));
      setUnread((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, readStatus: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)   return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <>
      <header className="h-16 bg-bg border-b border-border flex items-center justify-between px-8 flex-shrink-0 z-10">
        {/* Logo link */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
            <span className="text-accent font-bold text-sm tracking-tighter">TF</span>
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight hidden sm:block group-hover:text-accent transition-colors">
            TrackFlow
          </span>
        </Link>

        {/* Current Focus */}
        {settings?.currentFocus && (
          <div className="hidden md:flex items-center gap-2 bg-surface-2 border border-border px-3 py-1.5 rounded-full shadow-sm ml-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-text-muted">Focus:</span>
            <span className="text-xs font-bold text-white max-w-[200px] truncate">{settings.currentFocus}</span>
          </div>
        )}

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-5">
          {/* Help */}
          <button
            onClick={() => setHelpOpen(true)}
            className="text-text-muted hover:text-white transition-colors"
            title="Help & Support"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) loadNotifs(); }}
              className="text-text-muted hover:text-white transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-bg">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <span className="text-white font-bold text-sm">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={handleMarkAllRead} title="Mark all read" className="text-text-muted hover:text-white transition-colors">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-text-muted hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifs.length === 0 ? (
                    <div className="py-10 text-center text-text-muted text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${n.readStatus ? 'opacity-60' : 'bg-accent/5'}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.readStatus ? 'bg-transparent' : 'bg-accent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-text-muted/60 mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.readStatus && (
                          <button
                            onClick={() => handleMarkRead(n.id)}
                            className="text-text-muted hover:text-emerald-400 transition-colors flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Avatar / user menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen((o) => !o)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold shrink-0 overflow-hidden">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-white text-xs font-semibold leading-none">{user?.name ?? 'User'}</span>
                <span className="text-text-muted text-[10px] leading-none mt-0.5 truncate max-w-[120px]">{user?.email}</span>
              </div>
            </button>

            {userOpen && (
              <div className="absolute right-0 top-11 w-52 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                  <p className="text-text-muted text-xs truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/settings"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <Link
                    to="/members"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-white hover:bg-surface-2 transition-colors"
                  >
                    <User className="w-4 h-4" /> View Profile
                  </Link>
                </div>
                <div className="py-1 border-t border-border">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setHelpOpen(false)}>
          <div className="bg-surface border border-border rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Help & Support</h2>
              <button onClick={() => setHelpOpen(false)} className="text-text-muted hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { title: '📖 Documentation', desc: 'Learn how to use TrackFlow', href: '#' },
                { title: '🎯 Quick Start Guide', desc: 'Get up and running in 5 minutes', href: '#' },
                { title: '💬 Community Forum', desc: 'Ask questions and share tips', href: '#' },
                { title: '🐛 Report a Bug', desc: 'Help us improve the product', href: '#' },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-2 transition-colors block"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{item.title}</p>
                    <p className="text-text-muted text-xs mt-0.5">{item.desc}</p>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border text-center">
              <p className="text-text-muted text-xs">TrackFlow v1.0 · Built with Spring Boot & React</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
