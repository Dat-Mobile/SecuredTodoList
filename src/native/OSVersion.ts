import {NativeModules} from 'react-native';

export async function getOSVersion(): Promise<string> {
  return NativeModules.OSVersion.getOSVersion();
}
