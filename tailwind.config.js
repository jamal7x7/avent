module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        background: {
          DEFAULT: 'var(--background-light)',
          dark: 'var(--background-dark)',
        },
      },
    },
  },
  plugins: [
    // ... your plugins
  ],
}; 