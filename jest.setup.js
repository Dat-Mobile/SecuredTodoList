// Robust workaround for VirtualizedList/FlatList state error in tests
try {
  Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', {
    get() {
      return true;
    },
    configurable: true,
  });
} catch (e) {
  // If already defined, redefine it
  try {
    delete global.IS_REACT_ACT_ENVIRONMENT;
    Object.defineProperty(global, 'IS_REACT_ACT_ENVIRONMENT', {
      get() {
        return true;
      },
      configurable: true,
    });
  } catch (err) {
    // ignore
  }
}

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({success: true}),
}));
