import { useState, useEffect, Suspense, lazy } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const AuthScene = lazy(() => import('@/components/auth/AuthScene'));

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('error') === 'session_expired') {
      toast('Your session has expired. Please log in again.', 'info');
      navigate('/login', { replace: true });
    }
  }, [location, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      login(data.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex w-full">
      {/* Left Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-10 rounded-2xl relative overflow-hidden"
        >
          {/* Subtle glow inside the panel */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-purple opacity-50" />
          
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">TrackFlow</span>
          </div>

          <h2 className="font-display font-semibold text-3xl mb-2">Welcome back</h2>
          <p className="text-text-muted mb-8">Sign in to your FAANG-level workspace</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6 text-sm text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button type="submit" size="lg" loading={loading} className="w-full mt-4 shadow-glow">
              Sign in
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-8">
            No account?{' '}
            <Link to="/register" className="text-accent hover:text-accent-hover transition-colors font-semibold">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right 3D Particle Side */}
      <div className="hidden lg:block w-1/2 relative bg-black border-l border-white/5 overflow-hidden">
        <Suspense fallback={null}>
          <AuthScene />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-r from-bg to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
