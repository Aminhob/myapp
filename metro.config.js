const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

const blockedPattern = new RegExp(
  'expo-modules-core[\\\\/]expo-module-gradle-plugin[\\\\/](build|\\.gradle|\\.kotlin)[\\\\/].*'
);

config.resolver = config.resolver || {};
config.resolver.blockList = blockedPattern;

module.exports = config;
