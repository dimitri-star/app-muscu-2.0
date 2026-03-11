const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix: Zustand v5 uses import.meta.env (ESM syntax) which Metro doesn't support on web.
// Force CommonJS resolution to avoid import.meta errors.
config.resolver = {
  ...config.resolver,
  unstable_conditionNames: ['require', 'default'],
};

// Allow Babel to transform zustand (normally node_modules are skipped).
// This lets our babel.config.js plugin replace import.meta with undefined.
config.transformer = {
  ...config.transformer,
  transformIgnorePatterns: [
    'node_modules/(?!(zustand|@react-native|react-native|expo|@expo|react-navigation|@react-navigation)/)',
  ],
};

module.exports = config;
