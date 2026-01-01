import { Platform } from 'react-native';

/**
 * Platform detection utilities for cross-platform support
 */

export type PlatformType = 'ios' | 'android' | 'web';

/**
 * Get the current platform
 */
export const getPlatform = (): PlatformType => {
  return Platform.OS as PlatformType;
};

/**
 * Check if running on web
 */
export const isWeb = (): boolean => {
  return Platform.OS === 'web';
};

/**
 * Check if running on native (iOS or Android)
 */
export const isNative = (): boolean => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Check if running on iOS
 */
export const isIOS = (): boolean => {
  return Platform.OS === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = (): boolean => {
  return Platform.OS === 'android';
};

/**
 * Get platform-specific value
 */
export const platformSelect = <T>(values: {
  ios?: T;
  android?: T;
  web?: T;
  native?: T;
  default?: T;
}): T | undefined => {
  if (isIOS() && values.ios !== undefined) {
    return values.ios;
  }
  if (isAndroid() && values.android !== undefined) {
    return values.android;
  }
  if (isWeb() && values.web !== undefined) {
    return values.web;
  }
  if (isNative() && values.native !== undefined) {
    return values.native;
  }
  return values.default;
};
