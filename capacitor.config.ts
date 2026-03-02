import type { CapacitorConfig } from "@capacitor/cli";

const isDev = process.env.NODE_ENV === "development";

/**
 * DEV WRAPPER URL
 * - Android emulator: http://10.0.2.2:3000
 * - Physical device: http://<your-lan-ip>:3000
 * - iOS simulator: http://localhost:3000 (or LAN IP)
 */
const devServerUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  // Prefer this unless you've already shipped com.ecodia.sidequests
  appId: "au.ecodia.sidequests",
  appName: "Sidequests",

  // PROD (and fallback): bundled static export folder
  webDir: "out",

  // DEV: wrap a running web server for rapid iteration
  ...(isDev && devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: devServerUrl.startsWith("http://"),
          androidScheme: devServerUrl.startsWith("http://") ? "http" : "https",
          allowNavigation: ["*.ecodia.au", "*.supabase.co", "*.supabase.in"],
        },
      }
    : {}),

  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#396041",
    },
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#396041",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    Haptics: {},
    Keyboard: {
      // If you have @capacitor/keyboard installed, you can use the enum,
      // but string works too.
      resize: "body",
      style: "DARK",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
