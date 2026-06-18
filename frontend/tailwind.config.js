/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#0b0f1a',
          surface: '#111827',
          surface2: '#1a2233',
          surface3: '#1f2a3e',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover: '#5254cc',
          purple: '#8b5cf6',
          pink: '#ec4899',
        },
        border: 'rgba(255,255,255,0.08)',
        text: {
          DEFAULT: '#f1f5f9',
          muted: '#94a3b8',
          dim: '#64748b',
        },
        status: {
          todo:        '#64748b',
          in_progress: '#f59e0b',
          review:      '#6366f1',
          done:        '#10b981',
        },
        priority: {
          low:      '#64748b',
          medium:   '#f59e0b',
          high:     '#f97316',
          critical: '#ef4444',
        },
      },
      borderRadius: {
        card: '1rem',
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 24px rgba(99,102,241,0.3)',
        'glow-sm': '0 0 12px rgba(99,102,241,0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0b0f1a 0%, #1a1040 50%, #0b0f1a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-up': 'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
