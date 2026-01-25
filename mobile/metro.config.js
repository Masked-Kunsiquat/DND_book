const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'isomorphic-webcrypto/src/react-native': path.resolve(
    __dirname,
    'src/shims/isomorphic-webcrypto/src/react-native.ts'
  ),
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'isomorphic-webcrypto/src/react-native') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(
        __dirname,
        'src/shims/isomorphic-webcrypto/src/react-native.ts'
      ),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
