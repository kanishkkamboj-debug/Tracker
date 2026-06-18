import { Suspense, lazy, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, ArrowRight, Kanban, BarChart3, Shield } from 'lucide-react';
import Button from '@/components/ui/Button';

// Lazy-load Three.js scene so it never blocks the main bundle
const HeroScene = lazy(() => import('@/components/landing/HeroScene'));

// Detect if reduced motion is preferred or WebGL likely unsupported
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowEnd = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
const useStaticHero = prefersReducedMotion || isLowEnd;

// ─── Static fallback hero ─────────────────────────────────────────────────────
function StaticHero() {
  return (
    <div className="absolute inset-0 bg-hero-gradient">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-accent-purple/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  { icon: Kanban,   title: 'Kanban Board',  desc: 'Drag tasks across columns. Status updates instantly.' },
  { icon: BarChart3, title: 'Live Dashboard', desc: 'See your project health at a glance with live charts.' },
  { icon: Shield,   title: 'Secure by Default', desc: 'JWT auth, BCrypt passwords, no data shared.' },
];

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 0.35], [0, -80]);

  return (
    <div ref={containerRef} className="bg-bg text-text">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md bg-bg/60 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-accent-purple flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-lg">TrackFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 3D or Static background */}
        {useStaticHero ? (
          <StaticHero />
        ) : (
          <Suspense fallback={<StaticHero />}>
            <div className="absolute inset-0">
              <HeroScene scrollProgress={scrollYProgress} />
            </div>
          </Suspense>
        )}

        {/* Hero text */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-6">
              <Zap className="w-3.5 h-3.5" />
              Lean project tracking — no bloat
            </div>

            <h1 className="font-display font-bold text-5xl md:text-7xl leading-tight mb-6">
              Ship projects{' '}
              <span className="bg-gradient-to-r from-accent to-accent-purple bg-clip-text text-transparent">
                faster
              </span>
            </h1>

            <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-10">
              TrackFlow gives your team a Kanban board, live dashboard, and clean project management
              — all in one place. No enterprise complexity.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register">
                <Button size="lg" className="shadow-glow">
                  Start free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">Sign in</Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="text-xs text-text-dim">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className="w-1 h-6 bg-gradient-to-b from-accent to-transparent rounded-full"
          />
        </motion.div>
      </section>

      {/* ── Features Section ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h2 className="font-display font-bold text-4xl text-text mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Built for developers and small teams who need speed, not spreadsheets.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.45 }}
                whileHover={{ y: -4 }}
                className="bg-bg-surface border border-border rounded-card p-8 shadow-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent-purple/20 border border-accent/20 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display font-semibold text-xl text-text mb-2">{title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center bg-gradient-to-br from-accent/10 to-accent-purple/10 border border-accent/20 rounded-xl2 p-12 shadow-glow"
        >
          <h2 className="font-display font-bold text-3xl text-text mb-4">Ready to track smarter?</h2>
          <p className="text-text-muted mb-8">Join now and get your first project board in under 2 minutes.</p>
          <Link to="/register">
            <Button size="lg" className="shadow-glow">
              Create free account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-text-dim">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className="font-display font-bold text-text-muted">TrackFlow</span>
        </div>
        <p>© {new Date().getFullYear()} TrackFlow. Built with React + Spring Boot.</p>
      </footer>
    </div>
  );
}
