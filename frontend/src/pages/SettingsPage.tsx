import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { MapPin, Mail, Link as LinkIcon, Edit2, ChevronRight, CheckCircle2, Circle } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);

  return (
    <div className="max-w-[1200px] mx-auto p-8 space-y-6">
      
      {/* Profile Card */}
      <div className="glass-panel p-8">
        <div className="flex justify-between items-start">
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-3 flex items-center justify-center border border-border shadow-md shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold text-white tracking-tight">{user?.name || 'Alex Mercer'}</h1>
              <h2 className="text-lg font-semibold text-[#A5C0F3] mt-1">Senior Staff Engineer</h2>
              <p className="text-sm text-text-muted mt-3 max-w-2xl leading-relaxed">
                Leading frontend architecture and focusing on performance optimization and scalable component systems across the platform.
              </p>
              <div className="flex items-center gap-6 mt-4 text-sm text-text-muted">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> San Francisco, CA</div>
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user?.email || 'alex.m@trackflow.dev'}</div>
                <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> github.com/amercer</div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-md text-sm font-medium text-white transition-colors shadow-sm">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Personal Settings */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               Personal Settings
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center group cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#A5C0F3] transition-colors">Timezone</div>
                  <div className="text-xs text-text-muted mt-0.5">Pacific Time (PT)</div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-[#A5C0F3]" />
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex justify-between items-center group cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#A5C0F3] transition-colors">Language</div>
                  <div className="text-xs text-text-muted mt-0.5">English (US)</div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-[#A5C0F3]" />
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex justify-between items-center group cursor-pointer">
                <div>
                  <div className="text-sm font-semibold text-white group-hover:text-[#A5C0F3] transition-colors">Theme</div>
                  <div className="text-xs text-text-muted mt-0.5">System Default</div>
                </div>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-[#A5C0F3]" />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               Notifications
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Task Assignments</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#0B1120] border-border text-[#A5C0F3] rounded focus:ring-0" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Mentions</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 bg-[#0B1120] border-border text-[#A5C0F3] rounded focus:ring-0" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Project Updates</span>
                <input type="checkbox" className="w-4 h-4 bg-[#0B1120] border-border text-[#A5C0F3] rounded focus:ring-0" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">Marketing Emails</span>
                <input type="checkbox" className="w-4 h-4 bg-[#0B1120] border-border text-[#A5C0F3] rounded focus:ring-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Current Focus */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
               Current Focus
            </h3>
            <button className="text-xs font-semibold text-text-muted hover:text-white transition-colors">View All</button>
          </div>
          
          <div className="space-y-3">
            {/* Task 1 */}
            <div className="glass-panel p-4 flex items-start gap-4 hover:border-text-muted transition-colors cursor-pointer border border-border">
              <Circle className="w-5 h-5 text-text-muted mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white">Migrate Design System to Tailwind v3</span>
                  <span className="text-xs text-text-muted font-medium bg-surface-2 px-2 py-0.5 rounded border border-border">PROJ-442</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded uppercase tracking-wider">High Priority</span>
                  <span className="text-xs text-text-muted">Due Today</span>
                </div>
              </div>
            </div>

            {/* Task 2 */}
            <div className="glass-panel p-4 flex items-start gap-4 hover:border-text-muted transition-colors cursor-pointer border border-border">
              <Circle className="w-5 h-5 text-text-muted mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white">Review PR for Authentication Flow</span>
                  <span className="text-xs text-text-muted font-medium bg-surface-2 px-2 py-0.5 rounded border border-border">SEC-109</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded uppercase tracking-wider">Review</span>
                  <span className="text-xs text-text-muted">Tomorrow</span>
                </div>
              </div>
            </div>

            {/* Task 3 */}
            <div className="glass-panel p-4 flex items-start gap-4 border border-border opacity-60">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-text-muted line-through">Update Dependencies</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-text-muted">Completed 2 hrs ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
