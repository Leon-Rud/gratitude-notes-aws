/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#2563eb',
          600: '#1d4ed8'
        },
        success: '#047857',
        warning: '#b45309',
        error: '#dc2626'
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'pt-serif': ['PT Serif Caption', 'serif'],
      }
    }
  },
  plugins: []
};
