/**
 * Theme-aware colors are CSS variables (RGB channels, defined in index.css for light and .dark),
 * so opacity modifiers like `bg-ink/10` keep working and one class switches the whole app.
 */
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        tomato: {
          DEFAULT: '#F3543B',
          // Text/hover shade: darker in light mode, lighter in dark mode for contrast
          dark: themed('tomato-dark'),
          soft: themed('tomato-soft'),
        },
        mustard: {
          DEFAULT: '#FEC93C',
          dark: '#E9B21F',
          soft: themed('mustard-soft'),
        },
        forest: {
          DEFAULT: '#0F241A',
          light: '#1B3A2B',
        },
        leaf: {
          DEFAULT: '#217A46',
          soft: themed('leaf-soft'),
          text: themed('leaf-text'),
        },
        cocoa: '#7D3413',
        // Primary text color (dark in light mode, light in dark mode)
        ink: {
          DEFAULT: themed('ink'),
          soft: themed('ink-soft'),
          muted: themed('ink-muted'),
        },
        // Page background
        cream: {
          DEFAULT: themed('cream'),
          dark: themed('cream-dark'),
        },
        // Card / input background
        surface: themed('surface'),
        // Always-dark ink for text on fixed bright colors (mustard, white chips) in both modes
        night: '#1D1B23',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(29, 27, 35, 0.04), 0 8px 24px -12px rgba(29, 27, 35, 0.12)',
        lift: '0 2px 4px rgba(29, 27, 35, 0.06), 0 18px 40px -16px rgba(29, 27, 35, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'slide-down': 'slide-down 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
