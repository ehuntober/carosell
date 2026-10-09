export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#09090b',
        surface: {
          DEFAULT: '#111113',
          2: '#18181b',
          3: '#212126',
        },
        line: {
          DEFAULT: '#26262b',
          strong: '#3a3a41',
        },
        ink: {
          DEFAULT: '#f4f4f5',
          muted: '#a1a1aa',
          subtle: '#8b8b94',
        },
        accent: {
          DEFAULT: '#e11d48',
          hover: '#f43f5e',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#f87171',
        info: '#38bdf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
