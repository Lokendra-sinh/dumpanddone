/** @type {import('tailwindcss').Config} */
import tailwindConfig from "@dumpanddone/ui/tailwind";

export default {
  presets: [tailwindConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
    "../../packages/ui/src/**/*.{ts,js,tsx,jsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      boxShadow: {
        'inner-top': 'inset 0 1px 0 0 rgba(255,255,255,0.1)',
      },
      height: {
        "screen-minus-16": "calc(100vh - 64px)",
        "screen-minus-32": "calc(100vh - 150px)",
        content: "calc(100vh - 64px)",
        "screen-minus-48": "calc(100vh - 260px)",
      },
      keyframes: {
        particle: {
          '0%': {
            opacity: '1',
            transform: 'translate(-50%, -50%) translate(0, 0)'
          },
          '100%': {
            opacity: '0',
            transform: 'translate(-50%, -50%) translate(var(--tx), var(--ty))'
          }
        },
        'custom-fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "100% 400%",
            "background-position": "0% 0%",
          },
          "50%": {
            "background-size": "100% 400%",
            "background-position": "0% 100%",
          },
        },
        "border-pulse": {
          "0%": {
            borderColor: "hsl(var(--border) / 0.1)",
            boxShadow: "0 0 0 0 hsl(var(--border) / 0.1)",
          },
          "50%": {
            borderColor: "hsl(var(--border) / 0.3)",
            boxShadow: "0 0 0 4px hsl(var(--border) / 0.8)",
          },
          "100%": {
            borderColor: "hsl(var(--border) / 0.1)",
            boxShadow: "0 0 0 0 hsl(var(--border) / 0.1)",
          },
        }
      },
      animation: {
        'particle': 'particle var(--duration) ease-out var(--delay)',
        'custom-fade-in': 'custom-fade-in 1s ease-out forwards',
        "gradient-y": "gradient-y 2s ease-in-out infinite",
        "border-pulse": "border-pulse 2s ease-in-out infinite",
      },
      colors: {
        background: "hsl(var(--background))", // Pure white in light mode, Rich dark gray (#020817) in dark
        foreground: "hsl(var(--foreground))", // Dark gray in light mode, Light gray in dark
        
        card: {
          DEFAULT: "hsl(var(--card))", // Slightly off-white in light, Very dark blue in dark
          foreground: "hsl(var(--card-foreground))", // Dark gray text for cards
        },
        
        popover: {
          DEFAULT: "hsl(var(--popover))", // White in light, Dark gray-blue in dark
          foreground: "hsl(var(--popover-foreground))", // Text color for popovers
        },
        
        primary: {
          DEFAULT: "hsl(var(--primary))", // Vibrant blue (#2563eb)
          foreground: "hsl(var(--primary-foreground))", // White text for primary elements
        },
        
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Light gray in light, Dark gray in dark
          foreground: "hsl(var(--secondary-foreground))", // Contrast text for secondary
        },
        
        muted: {
          DEFAULT: "hsl(var(--muted))", // Very light gray, Nearly black in dark
          foreground: "hsl(var(--muted-foreground))", // Subtle text color
        },
        
        accent: {
          DEFAULT: "hsl(var(--accent))", // Light blue-gray in light, Dark blue-gray in dark
          foreground: "hsl(var(--accent-foreground))", // Text on accent colors
        },
        
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Error red (#ef4444)
          foreground: "hsl(var(--destructive-foreground))", // White text on error
        },
        
        border: "hsl(var(--border))", // Light gray border in light, Dark gray in dark
        input: "hsl(var(--input))", // Input field border color
        ring: "hsl(var(--ring))", // Focus ring color (usually blue)
        
        chart: {
          1: "hsl(var(--chart-1))", // First chart color (usually blue)
          2: "hsl(var(--chart-2))", // Second chart color (usually green)
          3: "hsl(var(--chart-3))", // Third chart color (usually yellow)
          4: "hsl(var(--chart-4))", // Fourth chart color (usually red)
          5: "hsl(var(--chart-5))", // Fifth chart color (usually purple)
        },
        
        brand: {
          DEFAULT: "hsl(var(--brand))", // Primary brand color
          foreground: "hsl(var(--brand-foreground))", // Text on brand color
        },
        
        highlight: {
          DEFAULT: "hsl(var(--highlight))", // Highlight background (usually soft yellow)
          foreground: "hsl(var(--highlight-foreground))", // Text on highlights
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      screens: {
        "main-hover": {
          raw: "(hover: hover)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar-hide")],
};