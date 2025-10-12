// Central place to configure API base URL for mobile
// Tip: On Android emulator use http://10.0.2.2:5000, on iOS simulator http://127.0.0.1:5000
// For real devices, use your computer's LAN IP, e.g., http://192.168.1.100:5000

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Allow override via Expo public env var
const ENV_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

let DEFAULT_BASE_URL = 'http://127.0.0.1:5000';
// Android emulator cannot use 127.0.0.1 to reach host
if (Platform.OS === 'android') DEFAULT_BASE_URL = 'http://10.0.2.2:5000';

// Try to derive your dev machine LAN IP from Expo hostUri (works in Expo Go)
const hostUri = Constants?.expoConfig?.hostUri || Constants?.manifest2?.extra?.expoClient?.hostUri || '';
let LAN_BASE_URL = null;
if (hostUri) {
  const host = hostUri.split(':')[0];
  if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    LAN_BASE_URL = `http://${host}:5000`;
  }
}

export const API_BASE_URL = ENV_URL || LAN_BASE_URL || DEFAULT_BASE_URL;
