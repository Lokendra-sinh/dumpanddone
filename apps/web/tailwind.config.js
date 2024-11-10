/** @type {import('tailwindcss').Config} */
import tailwindConfig from '@dumpanddone/ui/tailwind'

export default {
  presets: [tailwindConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,tsx,jsx}",
    "../../packages/ui/src/**/*.{ts,js,tsx,jsx}"
  ],
  theme: {
    extend: {},
  },
}

