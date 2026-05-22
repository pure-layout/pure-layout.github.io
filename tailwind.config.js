/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pure: '#000000',
        blue: { brand: '#2563EB' },
        cyan: { brand: '#06B6D4' },
        dark: {
          bg: '#03050F',       // Refletindo as cores do index
          surface: '#080D1A',
          card: '#0A1020'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        jetbrains: ['JetBrains Mono', 'monospace'],
        mono: ['JetBrains Mono', 'monospace'],
        clash: ['Clash Display', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      }
    }
  },
  plugins: [],
}
