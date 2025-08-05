import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
        "glass-bg": "hsl(0 0% 8%)",
        "glass-border": "hsl(0 0% 15%)",
        "orange-glow": "hsl(25 95% 53%)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideInUp: {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        glowPulse: {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(255, 106, 0, 0.4)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(255, 106, 0, 0.6), 0 0 40px rgba(255, 106, 0, 0.3)",
            transform: "scale(1.05)"
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%, 100%": { 
            boxShadow: "0 0 5px rgba(255, 106, 0, 0.5), 0 0 10px rgba(255, 106, 0, 0.3), 0 0 15px rgba(255, 106, 0, 0.1)"
          },
          "50%": { 
            boxShadow: "0 0 10px rgba(255, 106, 0, 0.8), 0 0 20px rgba(255, 106, 0, 0.5), 0 0 30px rgba(255, 106, 0, 0.3)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-subtle": "bounceSubtle 2s infinite",
        shimmer: "shimmer 2s infinite",
        "slide-in-up": "slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        glass: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        "orange-gradient": "linear-gradient(135deg, #ff6a00, #ff8533)",
        "orange-glow": "linear-gradient(135deg, rgba(255, 106, 0, 0.1), rgba(255, 133, 51, 0.05))",
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "glow-orange": "0 0 20px rgba(255, 106, 0, 0.4), 0 0 40px rgba(255, 106, 0, 0.2)",
        "glow-white": "0 0 15px rgba(255, 255, 255, 0.1), 0 0 30px rgba(255, 255, 255, 0.05)",
        "glow-strong": "0 0 30px rgba(255, 106, 0, 0.6), 0 0 60px rgba(255, 106, 0, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
