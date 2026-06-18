import AppRouter from '@/router/AppRouter';
import { useThemeInit } from '@/stores/useThemeInit';

export default function App() {
  useThemeInit();
  return <AppRouter />;
}
