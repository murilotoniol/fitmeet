module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-gesture-handler|react-native-toast-message|@react-navigation)/)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
