import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // Royal Green Futuristic Palette
        royal: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        primary: '#059669',
        secondary: '#10b981',
        accent: '#022c22',
        glow: '#34d399',
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
        'glow-xl': '0 0 60px rgba(16, 185, 129, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(16, 185, 129, 0.1)',
      },
      backgroundImage: {
        'gradient-royal': 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)',
        'gradient-royal-light': 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)',
        'gradient-glow': 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(236,253,245,0.9) 100%)',
        'grid-pattern': 'radial-gradient(circle, rgba(16,185,129,0.1) 1px, transparent 1px)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-in-left': 'slide-in-left 0.4s ease-out',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    }
  },
  plugins: []
};
export default config;
