const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-maps') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'src/shims/react-native-maps.web.tsx'),
    };
  }

  // La build ESM de zustand usa import.meta.env. El script de Expo web no es
  // type=module, asi que el navegador lo rechaza. La build CJS usa process.env.
  if (platform === 'web' && (moduleName === 'zustand' || moduleName.startsWith('zustand/')) && context.isESMImport) {
    return context.resolveRequest({ ...context, isESMImport: false }, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
