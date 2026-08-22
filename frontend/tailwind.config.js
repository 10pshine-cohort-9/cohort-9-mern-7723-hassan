/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Microsoft Word inspired palette
        word: {
          50: '#EEF3FB',
          100: '#D9E5F6',
          200: '#AFC9EB',
          300: '#7FA9DE',
          400: '#4A7FC9',
          500: '#2B579A', // classic Word blue
          600: '#204A85',
          700: '#173A6B',
          800: '#102A4E',
          900: '#0A1D36',
        },
        ink: '#201F1E',      // Office dark text
        subtle: '#605E5C',   // Office secondary text
        line: '#E1DFDD',     // Office border grey
        surface: '#FAF9F8',  // Office subtle background
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Segoe UI Web',
          '-apple-system',
          'BlinkMacSystemFont',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 2px 6px rgba(16, 42, 78, 0.08), 0 12px 32px rgba(16, 42, 78, 0.10)',
      },
      backgroundImage: {
        'word-gradient': 'linear-gradient(160deg, #2B579A 0%, #173A6B 100%)',
      },
    },
  },
  plugins: [],
}
