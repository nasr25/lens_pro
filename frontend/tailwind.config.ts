import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eff8fd',
          100: '#d9eef9',
          200: '#b3def4',
          300: '#7dc7eb',
          400: '#49aedf',
          500: '#2b95cc',
          600: '#1c79aa',
          700: '#186390',  // primary blue from logo
          800: '#165278',
          900: '#134264',
        },
        dark: '#3D3D3D',   // charcoal from logo
      },
    },
  },
  plugins: [forms],
} satisfies Config;
