/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'off-white': '#fdfdfd',
        'sumi-gray': '#333333',
      },
    },
  },
  plugins: [],
}

