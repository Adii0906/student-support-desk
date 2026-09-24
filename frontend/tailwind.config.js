/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1C2B39', soft: '#34475A', muted: '#5F6B76', faint: '#8A939B' },
        paper: { DEFAULT: '#F7F5F0', sheet: '#FDFCF9', sunk: '#EEEAE1' },
        rule: { DEFAULT: '#DDD7CA', strong: '#BDB5A3' },
        state: {
          open: '#4A6385',
          progress: '#8F6330',
          resolved: '#3E6A4B',
          escalated: '#6B4C73',
          breached: '#9C3B2E',
        },
        stamp: '#9C3B2E',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
        sans: ['"Public Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      fontSize: {
        display: ['3rem', { lineHeight: '1.08', letterSpacing: '-0.012em' }],
        title: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.006em' }],
        heading: ['1.25rem', { lineHeight: '1.35' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        meta: ['0.8125rem', { lineHeight: '1.4' }],
      },
      maxWidth: { measure: '68ch', page: '76rem' },
      borderRadius: { form: '3px' },
      boxShadow: {
        sheet: '0 1px 0 #DDD7CA, 0 22px 44px -28px rgba(28, 43, 57, 0.55)',
        pin: '0 2px 3px rgba(0, 0, 0, 0.35)',
        toast: '0 12px 28px -12px rgba(28, 43, 57, 0.6)',
      },
      transitionTimingFunction: { drawer: 'cubic-bezier(0.2, 0.7, 0.2, 1)' },
      keyframes: {
        'stamp-in': {
          '0%': { opacity: '0', transform: 'scale(1.7)' },
          '60%': { opacity: '0.9', transform: 'scale(0.94)' },
          '100%': { opacity: '0.85', transform: 'scale(1)' },
        },
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        'row-flash': {
          '0%': { backgroundColor: 'rgba(62, 106, 75, 0.18)' },
          '100%': { backgroundColor: 'rgba(62, 106, 75, 0)' },
        },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: {
        'stamp-in': 'stamp-in 480ms cubic-bezier(0.2, 0.7, 0.2, 1) 300ms both',
        'rise-in': 'rise-in 320ms ease-out both',
        'toast-in': 'toast-in 240ms ease-out both',
        'row-flash': 'row-flash 1.4s ease-out both',
        spin: 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [],
};
