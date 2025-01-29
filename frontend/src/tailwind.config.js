const flowbite = require('flowbite/plugin');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}', // Add this line
  ],
  theme: {
    extend: {},
  },
  plugins: [
    flowbite, // Add this line
  ],
};
