import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { MapPin, Mail, Link as LinkIcon, Edit2, ChevronRight, CheckCircle2, Circle, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const user = useAuthStore(s => s.user);
  const { t } = useTranslation();
  const { settings, updateSettings, fetchSettings, isLoading } = useSettingsStore();
  
  // Local state for editing profile
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    jobTitle: '',
    bio: '',
    location: '',
    githubUrl: ''
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setEditForm({
        jobTitle: settings.jobTitle || '',
        bio: settings.bio || '',
        location: settings.location || '',
        githubUrl: settings.githubUrl || ''
      });
    }
  }, [settings]);

  const handleProfileSave = async () => {
    await updateSettings(editForm);
    setIsEditing(false);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ theme: e.target.value });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ language: e.target.value });
  };

  const toggleNotif = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  if (isLoading && !settings.jobTitle) {
    return <div className="p-8 text-text-muted">Loading settings...</div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto p-8 space-y-6">
      
      {/* Profile Card */}
      <div className="glass-panel p-8">
        <div className="flex justify-between items-start">
          <div className="flex gap-6 w-full">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-3 flex items-center justify-center border border-border shadow-md shrink-0">
              {settings.avatarUrl || user?.avatarUrl ? (
                <img src={settings.avatarUrl || user?.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase() ?? 'A'}
                </span>
              )}
            </div>
            
            {isEditing ? (
              <div className="flex-1 space-y-3 mr-8">
                <input 
                  className="bg-surface-2 border border-border rounded px-3 py-1 text-white w-full text-lg"
                  value={editForm.jobTitle}
                  onChange={e => setEditForm({...editForm, jobTitle: e.target.value})}
                  placeholder="Job Title"
                />
                <textarea 
                  className="bg-surface-2 border border-border rounded px-3 py-2 text-white w-full text-sm h-20"
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Bio"
                />
                <div className="flex gap-4">
                  <input 
                    className="bg-surface-2 border border-border rounded px-3 py-1 text-white flex-1 text-sm"
                    value={editForm.location}
                    onChange={e => setEditForm({...editForm, location: e.target.value})}
                    placeholder="Location"
                  />
                  <input 
                    className="bg-surface-2 border border-border rounded px-3 py-1 text-white flex-1 text-sm"
                    value={editForm.githubUrl}
                    onChange={e => setEditForm({...editForm, githubUrl: e.target.value})}
                    placeholder="GitHub URL"
                  />
                </div>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">{user?.name}</h1>
                <h2 className="text-lg font-semibold text-accent mt-1">{settings.jobTitle || 'No Title'}</h2>
                <p className="text-sm text-text-muted mt-3 max-w-2xl leading-relaxed">
                  {settings.bio || 'No bio provided.'}
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-text-muted">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {settings.location || 'Unknown'}</div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user?.email}</div>
                  <div className="flex items-center gap-2"><LinkIcon className="w-4 h-4" /> {settings.githubUrl || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="flex gap-2">
              <Button onClick={() => setIsEditing(false)} className="bg-surface-2 hover:bg-surface-3 text-white">Cancel</Button>
              <Button onClick={handleProfileSave} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface-3 border border-border rounded-md text-sm font-medium text-white transition-colors shadow-sm whitespace-nowrap">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Personal Settings */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               {t('settings.title')}
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <div>
                  <div className="text-sm font-semibold text-white">{t('settings.timezone')}</div>
                  <select 
                    value={settings.timezone}
                    onChange={(e) => updateSettings({ timezone: e.target.value })}
                    className="mt-1 bg-surface-2 border border-border text-sm text-white rounded px-2 py-1 outline-none focus:border-accent"
                  >
                    <option value="PT">Pacific Time (PT)</option>
                    <option value="ET">Eastern Time (ET)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex justify-between items-center group">
                <div>
                  <div className="text-sm font-semibold text-white">{t('settings.language')}</div>
                  <select 
                    value={settings.language}
                    onChange={handleLanguageChange}
                    className="mt-1 bg-surface-2 border border-border text-sm text-white rounded px-2 py-1 outline-none focus:border-accent"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
              </div>
              <div className="w-full h-px bg-border/50" />
              <div className="flex justify-between items-center group">
                <div>
                  <div className="text-sm font-semibold text-white">{t('settings.theme')}</div>
                  <select 
                    value={settings.theme}
                    onChange={handleThemeChange}
                    className="mt-1 bg-surface-2 border border-border text-sm text-white rounded px-2 py-1 outline-none focus:border-accent"
                  >
                    <option value="dark">Dark Mode</option>
                    <option value="light">Light Mode</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
               {t('settings.notifications')}
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{t('settings.taskAssignments')}</span>
                <input 
                  type="checkbox" 
                  checked={settings.notifTaskAssignments} 
                  onChange={() => toggleNotif('notifTaskAssignments')}
                  className="w-4 h-4 bg-surface border-border text-accent rounded focus:ring-0 cursor-pointer" 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{t('settings.mentions')}</span>
                <input 
                  type="checkbox" 
                  checked={settings.notifMentions} 
                  onChange={() => toggleNotif('notifMentions')}
                  className="w-4 h-4 bg-surface border-border text-accent rounded focus:ring-0 cursor-pointer" 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{t('settings.projectUpdates')}</span>
                <input 
                  type="checkbox" 
                  checked={settings.notifProjectUpdates} 
                  onChange={() => toggleNotif('notifProjectUpdates')}
                  className="w-4 h-4 bg-surface border-border text-accent rounded focus:ring-0 cursor-pointer" 
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-white">{t('settings.marketingEmails')}</span>
                <input 
                  type="checkbox" 
                  checked={settings.notifMarketing} 
                  onChange={() => toggleNotif('notifMarketing')}
                  className="w-4 h-4 bg-surface border-border text-accent rounded focus:ring-0 cursor-pointer" 
                />
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-muted">Set Active Focus:</span>
              <input 
                className="bg-surface-2 border border-border rounded px-3 py-1 text-white text-sm"
                value={settings.currentFocus || ''}
                onChange={e => updateSettings({ currentFocus: e.target.value })}
                placeholder="What are you working on?"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Task 1 */}
            <div className="glass-panel p-4 flex items-start gap-4 hover:border-accent transition-colors cursor-pointer border border-border">
              <Circle className="w-5 h-5 text-text-muted mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-bold text-white">{settings.currentFocus || 'Select a focus task'}</span>
                  <span className="text-xs text-text-muted font-medium bg-surface-2 px-2 py-0.5 rounded border border-border">ACTIVE</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded uppercase tracking-wider">High Priority</span>
                  <span className="text-xs text-text-muted">Currently Working On</span>
                </div>
              </div>
            </div>

            {/* Task 2 */}
            <div className="glass-panel p-4 flex items-start gap-4 hover:border-text-muted transition-colors cursor-pointer border border-border opacity-60">
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
          </div>
        </div>
      </div>

    </div>
  );
}
