const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix: Zustand v5 uses import.meta.env (ESM syntax) which Metro doesn't support on web.
// Force CommonJS resolution to avoid import.meta errors.
config.resolver = {
  ...config.resolver,
  unstable_conditionNames: ['require', 'default'],
};

module.exports = config;
