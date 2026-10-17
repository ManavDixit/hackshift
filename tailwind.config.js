/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7FAFF',
        ink: {
          DEFAULT: '#18243A',
          soft: '#69758B',
          faint: '#9AA6BA',
        },
        primary: {
          50: '#E9F2FF',
          100: '#D6E6FF',
          200: '#B4CEFF',
          300: '#8AB2FF',
          400: '#5D93F9',
          500: '#3978F6',
          600: '#2660DB',
          700: '#1C4BAF',
          800: '#163D8C',
          900: '#112F6B',
        },
        teal: {
          50: '#E6FAF7',
          100: '#C8F2EB',
          200: '#96E5D9',
          300: '#5DD5C5',
          400: '#2EC4B0',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        mint: '#DFF7EC',
        lavender: '#EEE9FF',
        peach: '#FFF0E5',
        sky: '#E9F2FF',
        coral: {
          50: '#FFF0E5',
          100: '#FFDFD0',
          200: '#FFC3A8',
          300: '#F9A282',
          400: '#F07E5C',
          500: '#E4593A',
          600: '#C7462B',
        },
        violet: {
          50: '#F3F0FF',
          100: '#E9E3FF',
          200: '#D5CBFF',
          300: '#B8A6FF',
          400: '#9A82F5',
          500: '#7C63E8',
          600: '#6549CE',
          700: '#5038A6',
        },
        line: '#E5EBF3',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(24,36,58,0.04), 0 4px 16px rgba(24,36,58,0.05)',
        lift: '0 2px 4px rgba(24,36,58,0.05), 0 12px 32px rgba(24,36,58,0.10)',
        glow: '0 0 0 1px rgba(57,120,246,0.10), 0 8px 40px rgba(57,120,246,0.14)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.012)' },
        },
        blink: {
          '0%, 92%, 100%': { transform: 'scaleY(1)' },
          '95%': { transform: 'scaleY(0.08)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.96)', opacity: '0.7' },
          '70%': { transform: 'scale(1.18)', opacity: '0' },
          '100%': { transform: 'scale(1.18)', opacity: '0' },
        },
        'flow-dash': {
          to: { 'stroke-dashoffset': '-24' },
        },
        'wave-x': {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(3px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        breathe: 'breathe 5s ease-in-out infinite',
        blink: 'blink 6s infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.22,1,0.36,1) infinite',
        'flow-dash': 'flow-dash 0.9s linear infinite',
        'wave-x': 'wave-x 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
