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
            nixie: ['Nixie One', 'sans-serif'],
            dosis: ['Dosis', 'sans-serif'],
            mmd: ['Orbitron', 'monospace'],
            general: ['Barlow Condensed', 'sans-serif'],
          },
        colors: {
            'darkbckg': '#020a1d',//'#545B62',
            'darkbtn': '#9aa7b4',
            'darkbtnhover': '#82a87f',
            'gentlewhite': '#f8f9fa11',
            'mediumwhite': '#f8f9fa33',
            'darkwhite': '#f8f9fa88',
            'accent': '#c38975'
        },
        backgroundImage: {
            'btn-grad': 'linear-gradient(30deg, #9aa7b4, #707c8b)',
            'btn-hover-grad': 'linear-gradient(30deg, #82a87f, #5f7d5f)',
            'btn-boring-grad': 'linear-gradient(30deg, #2e2e2e, #404c5b)',
            'btn-accent-grad': 'linear-gradient(30deg, #a36b4d, #c38975)',
            'btn-light-grad': 'linear-gradient(0deg, #404c5b, #606c7b)',
            'btn-dark-grad': 'linear-gradient(0deg, #1e1e1e, #3e3e3e)',
            'bckgtile': "url(/public/tile.png)",
            'bgoval': 'linear-gradient(0deg, #0e0e0e 0%, #ffffff00 60%), radial-gradient(120% 290% at 54% 12%, #434a53, #0b0d0c 50%)',
          }
    },
  },
  plugins: [
    
  ],
}



