import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import AppShell from '@/components/layout/AppShell';
import Spinner from '@/components/ui/Spinner';

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────
const LandingPage       = lazy(() => import('@/pages/LandingPage'));
const LoginPage         = lazy(() => import('@/pages/LoginPage'));
const RegisterPage      = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage     = lazy(() => import('@/pages/DashboardPage'));
const ProjectsPage      = lazy(() => import('@/pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage'));
const TasksPage         = lazy(() => import('@/pages/TasksPage'));
const KanbanPage        = lazy(() => import('@/pages/KanbanPage'));
const MembersPage       = lazy(() => import('@/pages/MembersPage'));
const AnalyticsPage     = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage      = lazy(() => import('@/pages/SettingsPage'));
const TaskDetailsPage   = lazy(() => import('@/pages/TaskDetailsPage'));

// ─── Protected route wrapper ─────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// ─── Public-only route (redirect if logged in) ────────────────────────────────
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

const PageFallback = () => (
  <div className="flex h-screen items-center justify-center bg-bg">
    <Spinner size="lg" />
  </div>
);

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Protected — inside AppShell */}
          <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailsPage />} />
            <Route path="/kanban" element={<KanbanPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
