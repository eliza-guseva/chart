/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
        screens: {
            '3xl': '1920px', // Define the 3xl breakpoint at 1920px
            '4xl': '2560px', // Define the 4xl breakpoint at 2560px
          },
        fontFamily: {
            warnes: ['Warnes', 'sans-serif'],
            nixie: ['Nixie One', 'cursive'],
            dosis: ['Dosis', 'sans-serif'],
          },
        colors: {
            'darkbckg': '#020a1d',//'#545B62',
            'darkbtn': '#9aa7b4',
            'darkbtnhover': '#82a87f',
            'gentlewhite': '#f8f9fa11'
        },
        backgroundImage: {
            'btn-grad': 'linear-gradient(30deg, #9aa7b4, #707c8b)',
            'btn-hover-grad': 'linear-gradient(30deg, #82a87f, #5f7d5f)',
            'btn-boring-grad': 'linear-gradient(30deg, #545B62, #707c8b)',
            'bckgtile': "url(/public/tile.png)",
          }
    },
  },
  plugins: [],
}

