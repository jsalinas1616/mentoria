/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verde oscuro principal (botones, headers)
        primary: {
          DEFAULT: '#2D5016',
          light: '#3D6B22',
          dark: '#1F3A0F',
        },
        // Verde hoja Nadro
        leaf: {
          DEFAULT: '#6B8E23',
          light: '#7A9B3C',
          dark: '#5A7A1F',
        },
        // Acentos
        accent: {
          DEFAULT: '#2D5016',
          hover: '#3D6B22',
        },
        // Rojo maple (opcional para detalles)
        maple: {
          DEFAULT: '#B83A3A',
          light: '#C85050',
        },
        // Fondos beige/crema
        cream: {
          DEFAULT: '#F5F1E8',
          light: '#FAF8F3',
          dark: '#E8E4DB',
        },
        // Cards y contenedores
        card: {
          DEFAULT: '#FFFFFF',
          hover: '#F5F1E8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-leaf': 'linear-gradient(135deg, #6B8E23 0%, #2D5016 100%)',
      }
    },
  },
  plugins: [],
}


