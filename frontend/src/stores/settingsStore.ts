import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { settingsApi, UserSettings } from '@/api/settings';
import i18n from '@/i18n';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (lang: string) => void;
}

const defaultSettings: UserSettings = {
  theme: 'dark',
  language: 'en',
  timezone: 'PT',
  currentFocus: 'Migrate Design System',
  notifTaskAssignments: true,
  notifMentions: true,
  notifProjectUpdates: false,
  notifMarketing: false,
  jobTitle: 'Senior Staff Engineer',
  bio: 'Leading frontend architecture',
  location: 'San Francisco, CA',
  githubUrl: 'github.com/amercer',
  avatarUrl: ''
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isLoading: false,

      fetchSettings: async () => {
        set({ isLoading: true });
        try {
          const res = await settingsApi.get();
          const data = res.data.data;
          
          if (data) {
            set({ settings: data });
            get().setTheme(data.theme as 'dark' | 'light');
            get().setLanguage(data.language);
          }
        } catch (error) {
          console.error("Failed to fetch settings, using local", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateSettings: async (updates) => {
        const current = get().settings;
        const newSettings = { ...current, ...updates };
        
        // Optimistic update
        set({ settings: newSettings });
        
        if (updates.theme) get().setTheme(updates.theme as 'dark' | 'light');
        if (updates.language) get().setLanguage(updates.language);

        try {
          await settingsApi.update(updates);
        } catch (error) {
          console.error("Failed to update settings remotely", error);
          // Revert on failure could be implemented here
        }
      },

      setTheme: (theme) => {
        const root = window.document.documentElement;
        if (theme === 'light') {
          root.classList.add('light');
          root.classList.remove('dark');
        } else {
          root.classList.add('dark');
          root.classList.remove('light');
        }
      },

      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
      }
    }),
    {
      name: 'trackflow-settings',
      partialize: (state) => ({ settings: state.settings }), // Persist only settings to local storage
      onRehydrateStorage: () => (state) => {
        if (state?.settings?.theme) {
          state.setTheme(state.settings.theme as 'dark' | 'light');
        }
        if (state?.settings?.language) {
          state.setLanguage(state.settings.language);
        }
      }
    }
  )
);
