import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LayoutGrid, ArrowRight, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/api/auth';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.register({ name, email, password });
      if (response.data.success && response.data.data) {
        login(response.data.data);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] grid-bg flex flex-col justify-center items-center p-4 relative z-0">
      
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 relative z-10">
        <div className="w-12 h-12 rounded-lg bg-surface-3 flex items-center justify-center border border-border shadow-sm mb-4">
          <LayoutGrid className="w-6 h-6 text-[#A5C0F3]" />
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">TrackFlow</h1>
        <p className="text-sm text-text-muted mt-1">Productivity Suite</p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md glass-panel p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Create an account</h2>
          <p className="text-sm text-text-muted mt-2">Get started with your workspace today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-muted">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120] border border-border rounded-md text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors sm:text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-muted">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120] border border-border rounded-md text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors sm:text-sm"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-muted">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120] border border-border rounded-md text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            loading={isLoading}
            className="w-full py-2.5 bg-[#A5C0F3] hover:bg-[#93C5FD] text-black font-semibold rounded-md flex justify-center items-center"
          >
            Create Account <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

      </div>

      <p className="mt-8 text-sm text-text-muted relative z-10">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-[#A5C0F3] hover:text-[#93C5FD]">
          Log in instead
        </Link>
      </p>

    </div>
  );
}
