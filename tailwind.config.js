/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
        fontFamily: {
            warnes: ['Warnes', 'sans-serif'],
            nixie: ['Nixie One', 'cursive'],
          },
        colors: {
            'darkbckg': '#545B62',
            'darkbtn': '#5c8c56',
            'darkbtnhover': '#82a87f'
        }
    },
  },
  plugins: [],
}

