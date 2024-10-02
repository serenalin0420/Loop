/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "375px",
      sm: "576px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      backgroundImage: {
        "login-bg": "url('/src/pages/Login/bg.svg')",
        "mobile-login-bg": "url('/src/pages/Login/mobile-bg.svg')",
      },

      colors: {
        textcolor: {
          DEFAULT: "#262626",
          brown: "#6a5e4a",
        },
        icon: {
          DEFAULT: "#89795F",
        },
        button: {
          DEFAULT: "#bfaa87",
        },
        sun: {
          50: "#fff9eb",
          100: "#fdedc8",
          200: "#fada8d",
          300: "#f8c251",
          400: "#f6ab2a",
          500: "#f08910",
          600: "#d4650b",
          700: "#b0460d",
          800: "#8f3611",
          900: "#762d11",
          950: "#431505",
        },
        cerulean: {
          50: "#f2f9fd",
          100: "#e4f1fa",
          200: "#c2e4f5",
          300: "#8cd0ed",
          400: "#4fb7e1",
          500: "#34a8d7",
          600: "#1a7faf",
          700: "#16668e",
          800: "#165676",
          900: "#184962",
          950: "#102e41",
        },
        "neon-carrot": {
          50: "#fff7ed",
          100: "#ffeed4",
          200: "#ffd9a8",
          300: "#ffbd71",
          400: "#ff9f49",
          500: "#fe7711",
          600: "#ef5c07",
          700: "#c64308",
          800: "#9d360f",
          900: "#7e2e10",
          950: "#441406",
        },
      },
    },
  },
  plugins: [],
};
