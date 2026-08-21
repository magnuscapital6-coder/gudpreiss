/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: '#F7F9FC',
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#F1F5FB',
          blue: '#EAF2FF',
        },
        primary: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#065F46',
          600: '#047857',
          700: '#064E3B',
          DEFAULT: '#065F46',
          foreground: '#FFFFFF',
        },
        text: {
          primary: '#111827',
          secondary: '#64748B',
          muted: '#94A3B8',
          disabled: '#CBD5E1',
        },
        border: {
          DEFAULT: '#E5E7EB',
          soft: '#EEF2F7',
        },
        status: {
          success: '#16A34A',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        },
        sale: {
          DEFAULT: '#F59E0B',
          soft: '#FFF7E6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.15', fontWeight: '700' }],
        h1: ['clamp(1.75rem, 4vw, 2.25rem)', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.25', fontWeight: '700' }],
        h3: ['18px', { lineHeight: '24px', fontWeight: '600' }],
        h4: ['16px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '21px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '21px', fontWeight: '500' }],
        small: ['12px', { lineHeight: '18px', fontWeight: '400' }],
        tiny: ['10px', { lineHeight: '14px', fontWeight: '500' }],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'small': '0 1px 3px rgba(15, 23, 42, 0.06)',
        'card': '0 2px 8px rgba(15, 23, 42, 0.05)',
        'hover': '0 8px 24px rgba(15, 23, 42, 0.10)',
      },
      maxWidth: {
        'content': '1360px',
        'content-max': '1400px',
      },
    },
  },
  plugins: [],
}
