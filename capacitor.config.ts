import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor uses the shared web build as the native application source.
 * Native platform projects remain conversion targets and never own engine logic.
 */
const config: CapacitorConfig = {
  appId: "com.wenathlan.saddle",
  appName: "Saddle Browser",
  webDir: "web/dist/public",
  loggingBehavior: "none",
  android: {
    path: "android",
    webContentsDebuggingEnabled: false,
  },
  ios: {
    path: "ios",
    preferredContentMode: "mobile",
    webContentsDebuggingEnabled: false,
  },
};

export default config;
