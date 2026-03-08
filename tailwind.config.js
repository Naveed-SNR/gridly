/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: [
    "./popup.tsx",
    "./contents/**/*.tsx",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
