/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        textcolor: {
          DEFAULT: "#262626",
        },
        icon: {
          DEFAULT: "#89795F",
        },
        amber: {
          500: "#F6AB2A",
        },
      },
    },
  },
  plugins: [],
};
