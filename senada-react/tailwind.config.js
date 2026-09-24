/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1E3D',
          700: '#1B3A66',
          500: '#2E5090',
        },
        white: '#FFFFFF',
        gray: {
          50: '#F7F8FA',
          100: '#F2F4F7',
          200: '#E4E7EC',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
        },
        success: {
          DEFAULT: '#1E7F52',
          light: '#E8F5E9',
          border: '#A3D9A5',
        },
        danger: {
          DEFAULT: '#C1362E',
          light: '#FDE8E7',
          border: '#F5A3A0',
        },
        warning: {
          DEFAULT: '#B7791F',
          light: '#FEF3D6',
          border: '#F5D380',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(11, 30, 61, 0.05), 0 1px 2px rgba(11, 30, 61, 0.03)',
        card: '0 2px 6px rgba(11, 30, 61, 0.06), 0 1px 3px rgba(11, 30, 61, 0.04)',
        modal: '0 10px 25px -5px rgba(11, 30, 61, 0.15), 0 8px 10px -6px rgba(11, 30, 61, 0.1)',
      },
    },
  },
  plugins: [],
}
