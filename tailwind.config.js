/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    "./node_modules/flowbite/**/*.js"
],
  
  theme: {
    extend: {
      colors: {
        'midnight-blue': '#020035',
        'midnight-purple': '#280137',
        'custom-slate': '#77878B',
        'ghost': '#FAFAFF',
        'midnight-grey': '#242424',
        "midnight-red": "#240009",
        "midnight-rose": "#560421",
        'dim-grey': '#66666E',
        'dark-green': '#25291C',
        'light-slate': "#8A95A5",
        'dark-slate': "#474F5C"
      },
      fontFamily: {
        sans: ['Roboto','sans-serif']
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ]
};