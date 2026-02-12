import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Nautical Blue
        navy: {
          900: '#0A1628',
          800: '#1A2B4A',
          700: '#2A4060',
          600: '#3D5A80',
          500: '#4A6FA5',
        },
        // Ocean Accents
        ocean: {
          500: '#00A8E8',
          400: '#22B8E8',
          300: '#5CC8E8',
          200: '#A8E0F0',
          100: '#E0F4FA',
        },
        // Gold/Bronze Luxury
        gold: {
          500: '#C9A227',
          400: '#D9B73A',
          300: '#E8C94C',
          100: '#F5E6B3',
        },
        // Semantic
        success: {
          500: '#10B981',
        },
        warning: {
          500: '#F59E0B',
        },
        error: {
          500: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(10, 22, 40, 0.05)',
        'md': '0 4px 6px -1px rgba(10, 22, 40, 0.1), 0 2px 4px -2px rgba(10, 22, 40, 0.1)',
        'lg': '0 10px 15px -3px rgba(10, 22, 40, 0.1), 0 4px 6px -4px rgba(10, 22, 40, 0.1)',
        'xl': '0 20px 25px -5px rgba(10, 22, 40, 0.1), 0 8px 10px -6px rgba(10, 22, 40, 0.1)',
        'glow': '0 0 20px rgba(0, 168, 232, 0.3)',
        'gold': '0 0 20px rgba(201, 162, 39, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.5s ease forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
