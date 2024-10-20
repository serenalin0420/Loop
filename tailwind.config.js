/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      xs: "386px",
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
      keyframes: {
        swing: {
          "0%, 100%": { transform: "rotate(-36deg)" },
          "50%": { transform: "rotate(16deg)" },
        },
        horizontalSpin: {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateY(360deg)" },
        },
      },
      animation: {
        swing: "swing 1s ease-in-out infinite",
        horizontalSpin: "horizontalSpin 4s linear infinite",
      },

      colors: {
        textcolor: {
          DEFAULT: "#262626",
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
        "indian-khaki": {
          50: "#f9f7f3",
          100: "#f1ede3",
          200: "#e1dac7",
          300: "#cec1a3",
          400: "#bfaa87",
          500: "#ab8d64",
          600: "#9e7c58",
          700: "#84654a",
          800: "#6c5340",
          900: "#584536",
          950: "#2f231b",
        },
      },
    },
  },
  variants: {},
  plugins: [],
};
