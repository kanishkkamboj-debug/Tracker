import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LayoutGrid, Key, Building, ArrowRight, GitMerge } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed', error);
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

      {/* Login Card */}
      <div className="w-full max-w-md glass-panel p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Welcome back</h2>
          <p className="text-sm text-text-muted mt-2">Log in to your workspace to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-text-muted">Password</label>
              <button type="button" className="text-sm font-medium text-[#A5C0F3] hover:text-[#93C5FD]">Forgot Password?</button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-text-muted" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0B1120] border border-border rounded-md text-white placeholder-text-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-border bg-[#0B1120] text-accent focus:ring-accent"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted">
              Remember for 30 days
            </label>
          </div>

          <Button 
            type="submit" 
            isLoading={isLoading}
            className="w-full py-2.5 bg-[#A5C0F3] hover:bg-[#93C5FD] text-black font-semibold rounded-md flex justify-center items-center"
          >
            Log In <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-surface text-text-muted">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button className="flex justify-center items-center gap-2 py-2.5 px-4 border border-border rounded-md bg-[#0B1120] hover:bg-surface-2 transition-colors text-sm font-medium text-text-muted hover:text-white">
            <Building className="w-4 h-4" /> SAML SSO
          </button>
          <button className="flex justify-center items-center gap-2 py-2.5 px-4 border border-border rounded-md bg-[#0B1120] hover:bg-surface-2 transition-colors text-sm font-medium text-text-muted hover:text-white">
            <Key className="w-4 h-4" /> Passkey
          </button>
        </div>
      </div>

      <p className="mt-8 text-sm text-text-muted relative z-10">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#A5C0F3] hover:text-[#93C5FD]">
          Sign up for a new account
        </Link>
      </p>

    </div>
  );
}
