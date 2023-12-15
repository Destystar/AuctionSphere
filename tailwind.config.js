/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'midnight-blue': '#020035',
        'midnight-purple': '#280137',
        'custom-slate': '#77878B',
        'ghost': '#FAFAFF',
        'misty-rose': '#EAD7D7',
        'dim-grey': '#66666E',
      },
      fontFamily: {
        sans: ['Roboto','sans-serif']
      }
    }
  },
  plugins: []
};