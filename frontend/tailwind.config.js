/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Índigo moderno - Primary
        primary: {
          DEFAULT: '#6366F1',
          light: '#818CF8',
          dark: '#4F46E5',
          50: '#EEF2FF',
          100: '#E0E7FF',
        },
        // Violeta - Accent
        accent: {
          DEFAULT: '#8B5CF6',
          light: '#A78BFA',
          dark: '#7C3AED',
        },
        // Esmeralda - Success
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        },
        // Rosa - Alerts
        rose: {
          DEFAULT: '#F43F5E',
          light: '#FB7185',
          dark: '#E11D48',
        },
        // Fondos modernos
        background: {
          DEFAULT: '#F9FAFB',
          dark: '#F3F4F6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-mesh': 'radial-gradient(at 40% 20%, #EEF2FF 0px, transparent 50%), radial-gradient(at 80% 0%, #E0E7FF 0px, transparent 50%), radial-gradient(at 0% 50%, #F3F4F6 0px, transparent 50%)',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(99, 102, 241, 0.1), 0 10px 20px -2px rgba(99, 102, 241, 0.04)',
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
      }
    },
  },
  plugins: [],
}


