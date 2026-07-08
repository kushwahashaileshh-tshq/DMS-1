/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        police: {
          dark: '#0B1E36',   // Deep Navy Blue (UP Police Brand)
          blue: '#1E3A8A',   // Blue
          gold: '#D97706',   // Gold/Khaki Accent
          light: '#F3F4F6',  // Light Grey Background
          accent: '#EF4444', // Red Accent
        }
      }
    },
  },
  plugins: [],
}
