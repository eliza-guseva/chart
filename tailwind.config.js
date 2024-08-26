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
            'mediumwhite': '#f8f9fb33',
            'darkwhite': '#f8f9fa88',
            'bckglight':'#2b3945',
            'accent': '#b0b5c0'
        },
        backgroundImage: {
            'btn-grad': 'linear-gradient(30deg, #9aa7b4, #707c8b)',
            'btn-hover-grad': 'linear-gradient(90deg, #687682, #2b3945)',
            'btn-boring-grad': 'linear-gradient(90deg, #2b3945, #111517)',
            'btn-boring-rev-grad': 'linear-gradient(90deg, #111517, #2b3945)',
            'btn-accent-grad': 'linear-gradient(90deg, #a36b4d, #c38975)',
            'btn-light-grad': 'linear-gradient(0deg, #404c5b, #606c7b)',
            'btn-dark-grad': 'linear-gradient(0deg, #1e1e1e, #3e3e3e)',
            'bgoval': 'linear-gradient(0deg, #212121 0%, #ffffff00 60%), radial-gradient(100% 200% at 55% 12%, #343434, #212121 50%)',
          }
    },
  },
  plugins: [
    
  ],
}



