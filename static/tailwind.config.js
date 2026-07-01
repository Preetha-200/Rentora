/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        rentora: {
          dark: '#0B2545',
          purple: '#7B1FA2',
          purpleLight: '#9C27B0',
          grayLight: '#F4F5F7'
        }
      }
    }
  },
  plugins: []
};