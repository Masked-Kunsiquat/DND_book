import flowbite from 'flowbite/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // Vite uses index.html at the root
    './src/**/*.{js,jsx,ts,tsx}', 
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}', // Ensure Flowbite works
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite, // Enable Flowbite plugin
  ],
};
