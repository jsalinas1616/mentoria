/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
        colors: {
          // Verde moderno - Primary (inspirado en la imagen)
          primary: {
            DEFAULT: '#059669', // Emerald-600 - Verde principal
            light: '#10B981',   // Emerald-500 - Verde claro
            dark: '#047857',    // Emerald-700 - Verde oscuro
            50: '#ECFDF5',      // Emerald-50
            100: '#D1FAE5',     // Emerald-100
          },
          // Verde complementario - Accent
          accent: {
            DEFAULT: '#16A34A', // Green-600 - Verde complementario
            light: '#22C55E',   // Green-500 - Verde claro
            dark: '#15803D',    // Green-700 - Verde oscuro
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
            'gradient-primary': 'linear-gradient(135deg, #059669 0%, #16A34A 100%)',
            'gradient-mesh': 'radial-gradient(at 40% 20%, #ECFDF5 0px, transparent 50%), radial-gradient(at 80% 0%, #D1FAE5 0px, transparent 50%), radial-gradient(at 0% 50%, #F3F4F6 0px, transparent 50%)',
          },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(5, 150, 105, 0.1), 0 10px 20px -2px rgba(5, 150, 105, 0.04)',
        'glow': '0 0 20px rgba(22, 163, 74, 0.3)',
      }
    },
  },
  plugins: [],
}


