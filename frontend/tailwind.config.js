/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: '#FFFDFB',    // Soft warm luxury background
          dark: '#111111',     // Elegant black text
          accent: '#7A624E',   // Luxury Taupe for main buttons
          gold: '#C5A880',     // Premium tags
          muted: '#707070'     // Secondary gray text
        }
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}