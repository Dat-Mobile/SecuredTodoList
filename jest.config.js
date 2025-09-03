module.exports = {
  preset: 'react-native',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo|@expo|expo-local-authentication|expo-modules-core|react-native|@react-native|@react-native-async-storage|@react-navigation|@react-native-community)/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
