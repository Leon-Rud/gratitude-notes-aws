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
        error: '#dc2626',
        ui: {
          glass: 'rgba(255,255,255,0.1)',
          overlay: 'rgba(0,0,0,0.75)',
          border: '#d0d5dd',
          card: 'rgba(104,104,104,0.2)',
          input: '#524974',
          inputSubtle: '#574a7b',
          glassBorder: 'rgba(255,255,255,0.1)',
        },
        design: {
          background: 'rgba(144, 126, 173, 0.4)', // #907EAD at 40%
          text: '#FFFFFF', // 100%
          button: 'rgba(0, 0, 0, 0.75)', // #000000 at 75%
        }
      },
      borderRadius: {
        'pill-sm': '50px',
        'pill': '60px',
        'card': '16px',
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'manrope': ['Manrope', 'sans-serif'],
        'pt-serif': ['PT Serif Caption', 'serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body': ['24px', { lineHeight: '1.2', letterSpacing: '0.12em' }],
        'n1': ['20px', { lineHeight: '1.2', letterSpacing: '0.12em' }],
      },
      borderWidth: {
        'thin': '1.5px',
      },
      backdropBlur: {
        'glass': '7.5px',
      }
    }
  },
};
