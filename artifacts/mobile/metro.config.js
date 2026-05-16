const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  "barcode-detector": path.resolve(
    __dirname,
    "../../node_modules/.pnpm/barcode-detector@3.1.3/node_modules/barcode-detector"
  ),
};

module.exports = config;
