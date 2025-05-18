/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3498db',
          dark: '#2980b9',
        },
        secondary: {
          DEFAULT: '#2ecc71',
          dark: '#27ae60',
        },
        danger: '#e74c3c',
        warning: '#f39c12',
        light: '#ecf0f1',
        dark: '#34495e',
        darker: '#2c3e50',
        gray: '#95a5a6',
      }
    },
  },
  plugins: [],
}