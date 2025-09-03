import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Wrapper around expo-local-authentication for easy mocking in tests.
 * Returns true if user passes biometric/passcode auth.
 */
export async function requestAuth(reason = 'Authenticate to modify your TODOs'): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) {
      // Fallback: prompt with device credentials if available
      const fallback = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        disableDeviceFallback: false,
      });
      return !!fallback.success;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      disableDeviceFallback: false,
    });
    return !!result.success;
  } catch (e) {
    console.warn('Auth error', e);
    return false;
  }
}
