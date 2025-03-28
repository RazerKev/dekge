const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */

module.exports = {
  // important: true,
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Roboto", ...fontFamily.sans],
      "100": ["Roboto", { weight: 100 }],
      "300": ["Roboto", { weight: 300 }],
      "400": ["Roboto", { weight: 400 }],
      "500": ["Roboto", { weight: 500 }],
      "700": ["Roboto", { weight: 700 }],
      "900": ["Roboto", { weight: 900 }],
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      scale: {
        "150": "1.5",
        "200": "2",
        "300": "3",
        "400": "4",
        "500": "5",
        "600": "6",
      },
      blur: {
        "4xl": "100px",
        "5xl": "150px",
        "6xl": "250px",
      },
      colors: {
        white: "#ffffff",
        gray: "#e0e0e0",
        navcolor: "#5B485B",
        "dark-gray": "#373737",
        "light-white": "#F4F4F4",
        "dark-black": "#1e1e1e",
        "light-purple": "#a364ff",
        "dark-purple": "#6c35de",
        "dark-medium-purple": "#342a45",
        "dark-light-purple": "#4d425f",
        "night-purple": "#241b35",
        "light-pink": "#ffc7ff",
        purpink: "#cb80ff",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "smoothnav-down": {
          "0%": { top: "-100px" },
          "100%": { top: "0px" },
        },
        "smoothnav-up": {
          "0%": { top: "0px" },
          "100%": { top: "-100px" },
        },
        shine: {
          "0%": { transform: "skewX(-15deg) translateX(-100%)" },
          "11.50%": { transform: "skewX(-15deg) translateX(200%)" },
          "100%": { transform: "skewX(-15deg) translateX(200%)" },
        },
        "arrow-slide": {
          "0%": { transform: "translateX(0)" },
          "35%": { transform: "translateX(20%)" },
          "55%": { transform: "translateX(-15%)" },
          "70%": { transform: "translateX(2%)" },
          "100%": { transform: "translateX(0)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "smoothnav-down": "smoothnav-down 0.4s ease-in-out",
        "smoothnav-up": "smoothnav-up 0.4s ease-in-out",
        shine: "shine 5s ease-in-out infinite",
        "arrow-slide": "arrow-slide 2s ease-in-out infinite",
      },
      maskImage: {
        'text-gradient': 'linear-gradient(to right, black, transparent)',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
