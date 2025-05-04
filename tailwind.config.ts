import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        "cube-spin": {
          '0%': {
            transform: 'rotate(45deg) rotateX(-25deg) rotateY(25deg)'
          },
          '50%': {
            transform: 'rotate(45deg) rotateX(-385deg) rotateY(25deg)'
          },
          '100%': {
            transform: 'rotate(45deg) rotateX(-385deg) rotateY(385deg)'
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        fadeIn: 'fadeIn 0.5s ease-out',
        slideUp: 'slideUp 0.5s ease-out forwards',
        'gradient': 'gradient 8s linear infinite',
        'cube-spin': 'cube-spin 2s infinite ease',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.transform-style-preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.cube-face-1': {
          transform: 'translateZ(-50%) rotateY(180deg)',
        },
        '.cube-face-2': {
          transform: 'rotateY(-270deg) translateX(50%)',
          transformOrigin: 'top right',
        },
        '.cube-face-3': {
          transform: 'rotateY(270deg) translateX(-50%)',
          transformOrigin: 'center left',
        },
        '.cube-face-4': {
          transform: 'rotateX(90deg) translateY(-50%)',
          transformOrigin: 'top center',
        },
        '.cube-face-5': {
          transform: 'rotateX(-90deg) translateY(50%)',
          transformOrigin: 'bottom center',
        },
        '.cube-face-6': {
          transform: 'translateZ(50%)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}

export default config

