/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  safelist: [
    // Specific classes that must be included
    'bg-gray-100',
    'dark:bg-gray-900',
    'bg-white',
    'dark:bg-gray-800',
    'dark:bg-gray-700',
    'dark:bg-black',
    'text-gray-800',
    'dark:text-white',
    'dark:text-gray-200',
    'dark:text-gray-300',
    'dark:text-gray-400',
    'dark:border-gray-700',
    'dark:border-gray-600',
    // Pattern for dark mode colors
    { pattern: /bg-gray-(100|800|900)/ },
    { pattern: /text-gray-(200|300|400|500|600|700|800)/ },
    { pattern: /border-gray-(200|600|700)/ },
  ],
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