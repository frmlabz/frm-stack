// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: [
      "**/node_modules/**",
      "package.json",
      "yarn.lock",
      "**/ios/**",
      "**/android/**",
      "**/assets/**",
      ".vscode",
      ".expo-shared",
      ".prettirrc",
      ".eslintrc.js",
      "dist/*",
    ],
  },
]);
