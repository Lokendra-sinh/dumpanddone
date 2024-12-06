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
      height: {
        "screen-minus-16": "calc(100vh - 64px)",
        "screen-minus-32": "calc(100vh - 160px)",
        "content": "calc(100vh - 64px)",
        "screen-minus-48": "calc(100vh - 260px)",
      },
      keyframes: {
		'gradient-y': {
          '0%, 100%': {
            'background-size': '100% 400%',
            'background-position': '0% 0%'
          },
          '50%': {
            'background-size': '100% 400%',
            'background-position': '0% 100%'
          },
        },
		'scan-line': {
			'0%': {
			  transform: 'translateY(0)',
			},
			'50%': {
				transform: 'translateY(396px)', // match container height
			},
			'100%': {
			  transform: 'translateY(0)',
			}
		  },
        "shadow-pulse": {
          "0%": {
            boxShadow: "0 0 5px 5px rgba(168, 85, 247, 0.5)",
          },
          "50%": {
            boxShadow: "0 0 40px 10px rgba(168, 85, 247, 0.7)",
          },
          "100%": {
            boxShadow: "0 0 80px 15px rgba(168, 85, 247, 0.5)",
          },
        },
        "dashboard-glow": {
          "0%": {
            transform: "scale(1)",
          },
          "50%": {
            transform: "scale(1.01)",
          },
          "100%": {
            transform: "scale(1.5)",
          },
        },
      },
      animation: {
        "dashboard-glow": "dashboard-glow 6s ease-in-out",
        "shadow-pulse": "shadow-pulse 6s ease-in-out",
        "animate-scan": "scan 2s ease-in-out infinite",
'scan-line': 'scan-line 2s ease-in-out infinite',
'gradient-y': 'gradient-y 2s ease-in-out infinite',
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
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
