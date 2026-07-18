/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./data/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2430",
          light: "#2B3646",
          soft: "#3E4B5C"
        },
        paper: {
          DEFAULT: "#EDEBE4",
          dark: "#E2DFD5"
        },
        brass: {
          DEFAULT: "#B8862F",
          light: "#D4A94F",
          dark: "#8F6A22"
        },
        bay: {
          DEFAULT: "#2F6F6E",
          light: "#4C8E8C",
          dark: "#1F4D4C"
        }
      },
      fontFamily: {
        display: ["var(--font-shippori)", "serif"],
        body: ["var(--font-noto)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(27,36,48,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(27,36,48,0.06) 1px, transparent 1px)"
      },
      backgroundSize: {
        grid: "28px 28px"
      }
    }
  },
  plugins: []
};
