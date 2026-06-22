import { useEffect } from 'react';
import { useSettingsStore } from './settingsStore';

export function useThemeInit() {
  const theme = useSettingsStore((s) => s.settings.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system' || !theme) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
}
