import { useState, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const AuthScene = lazy(() => import('@/components/auth/AuthScene'));

export default function RegisterPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const login    = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await authApi.register({ name, email, password });
      login(data.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const perks = ['Free forever', '3D Kanban Included', 'Live Dashboard'];

  return (
    <div className="min-h-screen bg-bg flex w-full flex-row-reverse">
      {/* Right Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md glass-panel p-10 rounded-2xl relative overflow-hidden"
        >
          {/* Subtle glow inside the panel */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-purple to-accent-pink opacity-50" />

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center shadow-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">TrackFlow</span>
          </div>

          <h2 className="font-display font-semibold text-3xl mb-2">Create account</h2>
          <p className="text-text-muted mb-5">Start tracking projects in minutes</p>

          <div className="flex flex-wrap gap-2 mb-8">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-1.5 text-xs text-text-muted font-medium bg-white/5 px-2 py-1 rounded-md border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                {perk}
              </div>
            ))}
          </div>

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
              label="Full name"
              id="register-name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email address"
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              id="register-password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" size="lg" loading={loading} className="w-full mt-4 shadow-glow">
              Create account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:text-accent-hover transition-colors font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Left 3D Particle Side */}
      <div className="hidden lg:block w-1/2 relative bg-black border-r border-white/5 overflow-hidden">
        <Suspense fallback={null}>
          <AuthScene />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-l from-bg to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
