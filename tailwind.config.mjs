/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  theme: {
    extend: {
      colors: {
        // DulceMood palette. White text only on sage (6.1:1) or cocoa;
        // blush is too light for text on it to be white, keep it as accent/background.
        cream: '#f5ebe6',
        sage: {
          DEFAULT: '#55674c',
          dark: '#46563e', // derived, hover state
        },
        blush: '#f9cdd5',
        cocoa: '#5c3a2e',
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
