/** @type {import('tailwindcss').Config} */
export default {
  // ⚠️ Important: Tailwind will only scan these paths for utility classes!
  // If the path is wrong, output.css will be nearly empty (Purge behavior).
  content: [
    "./views/**/*.ejs",
    "./public/**/*.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
