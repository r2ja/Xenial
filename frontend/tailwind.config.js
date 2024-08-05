module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'xenial-blue': '#56C5DB',
        'xenial-dark': '#1A1A1A',
        'xenial-gray': '#2A2A2A',
      },
      fontFamily: {
        'heading': ['"Krona One"', 'sans-serif'],
        'body': ['"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}