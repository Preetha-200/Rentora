/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        rentora: {
          dark: '#0B2545',
          blue: '#134074',
          blueMid: '#1E5799',
          purple: '#7B1FA2',
          purpleLight: '#9C27B0',
          purplePale: '#F3E5F5',
          grayLight: '#F4F5F7',
          grayMid: '#E5E7EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'premium': '0 20px 60px rgba(0, 0, 0, 0.15)',
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)'
      }
    }
  },
  plugins: []
};