/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sf-purple': '#9333EA',
        'sf-blue': '#3B82F6',
        'sf-green': '#22C55E',
        'sf-orange': '#F97316',
      },
    },
  },
  plugins: [],
}
