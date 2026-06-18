import AppRouter from '@/router/AppRouter';
import { useThemeInit } from '@/stores/useThemeInit';
import { ToastProvider } from '@/components/ui/ToastProvider';

export default function App() {
  useThemeInit();
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}
