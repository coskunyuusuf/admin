/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // class-based dark mode
  theme: {
    extend: {
      colors: {
        // Premium pembe-mor tema
        primary: {
          50: '#f8ecff',
          100: '#f1d9ff',
          200: '#e3b3ff',
          300: '#cc39bb',
          400: '#b830a3',
          500: '#a52791',
          600: '#92257f',
          700: '#7f236d',
          800: '#6c215b',
          900: '#591f49',
        },
        accent: {
          light: '#ff6b9d',
          DEFAULT: '#ff6b9d',
          dark: '#e55a8a',
        },
        dark: {
          bg: '#150216',
          card: '#1f0824',
          input: '#2a0a2e',
          border: '#3a1a3e',
        },
        light: {
          bg: '#ffffff',
          card: '#f8f9fa',
          input: '#f0f0f0',
          border: '#e0e0e0',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to-br, #2a0a2e, #150216)',
        'gradient-light': 'linear-gradient(to-br, #f8f9fa, #ffffff)',
        'gradient-primary': 'linear-gradient(to-r, #CC39BB, #ff6b9d)',
        'gradient-subtle': 'linear-gradient(135deg, #CC39BB/10 0%, #ff6b9d/10 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // Custom 'light' variant for light mode
    function({ addVariant }) {
      addVariant('light', ':is(:not(.dark) &)');
    },
  ],
}


