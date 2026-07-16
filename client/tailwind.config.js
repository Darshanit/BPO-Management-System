/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brutal: {
          yellow: '#FFE34F',
          blue: '#4D8BFF',
          pink: '#FF5FA2',
          green: '#78E08F',
          orange: '#FFB84C',
          white: '#FFFFFF',
          black: '#000000',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
      borderRadius: {
        brutal: '20px',
        'brutal-sm': '12px',
      },
      borderWidth: {
        brutal: '4px',
      },
      boxShadow: {
        // Floating card shadow signature: solid offset black shadow, no blur
        brutal: '6px 6px 0px 0px rgba(0,0,0,1)',
        'brutal-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-lg': '10px 10px 0px 0px rgba(0,0,0,1)',
        'brutal-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        popIn: 'popIn 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
