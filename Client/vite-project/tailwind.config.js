/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // 👈 this line tells Tailwind where to scan for class names
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
