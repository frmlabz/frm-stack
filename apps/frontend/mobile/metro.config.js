const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Increase watcher limits to prevent "too many open files" error
config.watchFolders = config.watchFolders || [];
config.resolver = {
  ...config.resolver,
  unstable_enablePackageExports: true,
};

module.exports = config;

