/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
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
        camponesa: {
          primary: "#326A6A",
          "primary-light": "#4F46E5",
          secondary: "#E57844",
          "secondary-light": "#F97316",
          accent: "#8B5CF6",
        },
        sunglow: {
          DEFAULT: "#FACC45",
          100: "#3f2f02",
          200: "#7d5f03",
          300: "#bc8e05",
          400: "#f9bd08",
          500: "#facc45",
          600: "#fbd76c",
          700: "#fce191",
          800: "#fdebb5",
          900: "#fef5da",
        },
        giants_orange: {
          DEFAULT: "#ED6637",
          100: "#351105",
          200: "#6a220a",
          300: "#a0330f",
          400: "#d54414",
          500: "#ed6637",
          600: "#f0835e",
          700: "#f4a287",
          800: "#f8c1af",
          900: "#fbe0d7",
        },
        viridian: {
          DEFAULT: "#36846E",
          100: "#0b1a16",
          200: "#15342b",
          300: "#204e41",
          400: "#2b6857",
          500: "#36846e",
          600: "#48b193",
          700: "#74c6af",
          800: "#a2d9ca",
          900: "#d1ece4",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #3B4096 0%, #4F46E5 100%)",
        "gradient-secondary": "linear-gradient(135deg, #E57844 0%, #F97316 100%)",
        "gradient-hero": "linear-gradient(135deg, #3B4096 0%, #E57844 100%)",
        glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": {
            opacity: "0",
            transform: "translateY(30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        slideInLeft: {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        scaleIn: {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        shimmer: {
          "0%": {
            "background-position": "-200px 0",
          },
          "100%": {
            "background-position": "calc(200px + 100%) 0",
          },
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        glow: "0 0 20px rgba(59, 64, 150, 0.3)",
        "glow-orange": "0 0 20px rgba(229, 120, 68, 0.3)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
