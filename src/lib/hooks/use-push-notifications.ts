"use client";

// npm install @capacitor/push-notifications
// (if not yet installed; the dynamic import below will fail gracefully if absent)

import { useState, useCallback } from "react";
import { savePushToken } from "@/lib/actions/push";

export type PushPermissionStatus =
  | "prompt"      // not yet requested
  | "granted"     // OS permission granted + registered
  | "denied"      // user denied
  | "unsupported" // non-native / plugin unavailable
  | "loading";    // request in flight

type UsePushNotificationsReturn = {
  permissionStatus: PushPermissionStatus;
  requestPermission: () => Promise<void>;
};

/**
 * usePushNotifications
 *
 * Provides a `requestPermission()` function that is intentionally NOT called
 * on mount - it should be triggered after a meaningful user action (e.g.
 * completing their first sidequest).  This avoids the "cold ask" permission
 * anti-pattern on iOS.
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [permissionStatus, setPermissionStatus] =
    useState<PushPermissionStatus>("prompt");

  const requestPermission = useCallback(async () => {
    // Guard: only works on native Capacitor
    let isNative = false;
    try {
      const { Capacitor } = await import("@capacitor/core");
      isNative = Capacitor.isNativePlatform();
    } catch {
      // Capacitor core not available
    }

    if (!isNative) {
      setPermissionStatus("unsupported");
      return;
    }

    setPermissionStatus("loading");

    try {
      // Dynamic import to avoid SSR issues and gracefully handle missing plugin
      const { PushNotifications } = await import(
        // @ts-expect-error - optional peer dependency
        "@capacitor/push-notifications"
      );

      const permResult = await PushNotifications.requestPermissions();

      if (permResult.receive !== "granted") {
        setPermissionStatus("denied");
        return;
      }

      // Permission granted - register for remote notifications
      await PushNotifications.register();

      // Listen for the registration token (fires once after register())
      PushNotifications.addListener(
        "registration",
        async (registrationToken: { value: string }) => {
          const { Capacitor } = await import("@capacitor/core");
          const platform =
            Capacitor.getPlatform() === "ios" ? "ios" : "android";

          // Persist token to Supabase via server action
          await savePushToken(registrationToken.value, platform);
          setPermissionStatus("granted");
        }
      );

      PushNotifications.addListener(
        "registrationError",
        (err: { error: string }) => {
          console.error("[push] Registration error:", err.error);
          setPermissionStatus("denied");
        }
      );
    } catch (e) {
      console.error("[push] Plugin unavailable or error:", e);
      setPermissionStatus("unsupported");
    }
  }, []);

  return { permissionStatus, requestPermission };
}
