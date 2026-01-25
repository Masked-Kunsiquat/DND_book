const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'isomorphic-webcrypto': path.resolve(__dirname, 'src/shims/isomorphic-webcrypto'),
};

module.exports = config;
