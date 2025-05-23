/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EDFAFA",
          100: "#D5F5F6",
          200: "#AEEBEF",
          300: "#79DCDF",
          400: "#38C7CC",
          500: "#0CABB3",
          600: "#0A909A",
          700: "#087178",
          800: "#065A62",
          900: "#044047",
          950: "#022B30",
        },
        secondary: {
          50: "#FFF8F0",
          100: "#FFEACB",
          200: "#FFD599",
          300: "#FFBE66",
          400: "#FFA833",
          500: "#FF9000",
          600: "#E67A00",
          700: "#CC6400",
          800: "#B34E00",
          900: "#993800",
          950: "#7A2D00",
        },
        accent: {
          50: "#F0FDF5",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          950: "#052E16",
        },
        neutral: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: "0 4px 20px 0 rgba(0, 0, 0, 0.05)",
        glow: "0 0 15px rgba(12, 171, 179, 0.3)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      ringOpacity: {
        DEFAULT: "0.5",
        0: "0",
        25: "0.25",
        50: "0.5",
        75: "0.75",
        100: "1",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "100%",
            color: "#334155",
            a: {
              color: "#0CABB3",
              "&:hover": {
                color: "#087178",
              },
            },
            h1: {
              color: "#1E293B",
            },
            h2: {
              color: "#1E293B",
            },
            h3: {
              color: "#1E293B",
            },
          },
        },
      },
    },
  },
  safelist: [
    // Add background colors for primary
    "bg-primary-50",
    "bg-primary-100",
    "bg-primary-200",
    "bg-primary-300",
    "bg-primary-400",
    "bg-primary-500",
    "bg-primary-600",
    "bg-primary-700",
    "bg-primary-800",
    "bg-primary-900",
    // Add background colors for secondary
    "bg-secondary-50",
    "bg-secondary-100",
    "bg-secondary-200",
    "bg-secondary-300",
    "bg-secondary-400",
    "bg-secondary-500",
    "bg-secondary-600",
    "bg-secondary-700",
    "bg-secondary-800",
    "bg-secondary-900",
    // Add text colors for primary and secondary
    "text-primary-50",
    "text-primary-100",
    "text-primary-200",
    "text-primary-300",
    "text-primary-400",
    "text-primary-500",
    "text-primary-600",
    "text-primary-700",
    "text-primary-800",
    "text-primary-900",
    "text-secondary-50",
    "text-secondary-100",
    "text-secondary-200",
    "text-secondary-300",
    "text-secondary-400",
    "text-secondary-500",
    "text-secondary-600",
    "text-secondary-700",
    "text-secondary-800",
    "text-secondary-900",
    // Border colors
    "border-primary-100",
    "border-primary-200",
    "border-primary-300",
    "border-primary-400",
    "border-primary-500",
    "border-secondary-100",
    "border-secondary-200",
    "border-secondary-300",
    "border-secondary-400",
    "border-secondary-500",
  ],
  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        ".focus-ring": {
          outline: "none",
          "box-shadow": "0 0 0 3px rgba(12, 171, 179, 0.5)",
        },
        ".bg-primary-gradient": {
          "background-image": "linear-gradient(135deg, #0CABB3, #087178)",
        },
        ".bg-secondary-gradient": {
          "background-image": "linear-gradient(135deg, #FF9000, #E67A00)",
        },
        ".text-gradient": {
          "background-clip": "text",
          "-webkit-background-clip": "text",
          color: "transparent",
          "background-image": "linear-gradient(to right, #0CABB3, #FF9000)",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
};
