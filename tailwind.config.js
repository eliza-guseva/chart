/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
        fontFamily: {
            warnes: ['Warnes', 'sans-serif'],
            nixie: ['Nixie One', 'cursive'],
            dosis: ['Dosis', 'sans-serif'],
          },
        colors: {
            'darkbckg': '#545B62',
            'darkbtn': '#9aa7b4',
            'darkbtnhover': '#82a87f'
        },
        backgroundImage: {
            'btn-grad': 'linear-gradient(30deg, #9aa7b4, #707c8b)',
            'btn-hover-grad': 'linear-gradient(30deg, #82a87f, #5f7d5f)',
            'btn-boring-grad': 'linear-gradient(30deg, #545B62, #707c8b)'
          }
    },
  },
  plugins: [],
}

