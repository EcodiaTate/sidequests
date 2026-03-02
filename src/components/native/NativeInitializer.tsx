"use client";

// npm install @capacitor/push-notifications
// (if the push-notifications plugin is not yet installed, the dynamic import
//  will fail silently — all push features are wrapped in try/catch)

import { useEffect, useRef, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { savePushToken } from "@/lib/actions/push";

// Exported so other components can trigger the deferred permission request
// (e.g. after a user completes their first sidequest — avoid the cold-ask
//  anti-pattern that tanks iOS acceptance rates).
let _requestPushPermission: (() => Promise<void>) | null = null;

export function requestPushPermission(): Promise<void> {
  if (_requestPushPermission) return _requestPushPermission();
  return Promise.resolve();
}

export function NativeInitializer() {
  const router = useRouter();
  const { toast } = useToast();
  const pushListenersAdded = useRef(false);

  // ── Push notification permission + registration ────────────────────────
  // Called externally via requestPushPermission() after a meaningful action.
  const setupPush = useCallback(async () => {
    try {
      const { PushNotifications } = await import(
        // @ts-expect-error — optional peer dependency
        "@capacitor/push-notifications"
      );

      const permResult = await PushNotifications.requestPermissions();
      if (permResult.receive !== "granted") return;

      await PushNotifications.register();
    } catch {
      // Plugin not installed or permission flow already handled
    }
  }, []);

  // Expose the deferred permission function for external callers
  useEffect(() => {
    _requestPushPermission = setupPush;
    return () => {
      _requestPushPermission = null;
    };
  }, [setupPush]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    async function initNative() {
      // ── Status bar ──────────────────────────────────────────────────────
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#00000000" });
      } catch {
        // StatusBar plugin not available (web)
      }

      // ── Splash screen ───────────────────────────────────────────────────
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        // SplashScreen plugin not available
      }

      // ── Push notification listeners ─────────────────────────────────────
      // Set up listeners once regardless of whether permission has been granted.
      // The registration listener fires after the user grants permission later.
      if (!pushListenersAdded.current) {
        pushListenersAdded.current = true;

        try {
          const { PushNotifications } = await import(
            // @ts-expect-error — optional peer dependency
            "@capacitor/push-notifications"
          );

          // Token registration — save to Supabase
          PushNotifications.addListener(
            "registration",
            async (registrationToken: { value: string }) => {
              const platform =
                Capacitor.getPlatform() === "ios" ? "ios" : "android";
              await savePushToken(registrationToken.value, platform);
            }
          );

          // Registration error
          PushNotifications.addListener(
            "registrationError",
            (err: { error: string }) => {
              console.error("[push] Registration failed:", err.error);
            }
          );

          // Foreground notification received — show an in-app toast
          PushNotifications.addListener(
            "pushNotificationReceived",
            (notification: { title?: string; body?: string }) => {
              const msg = notification.body || notification.title || "New notification";
              toast(msg, "info");
            }
          );

          // Notification tapped — route to the deep-link page if provided
          PushNotifications.addListener(
            "pushNotificationActionPerformed",
            (action: {
              notification: {
                data?: { page?: string; url?: string };
              };
            }) => {
              const page =
                action.notification.data?.page ||
                action.notification.data?.url;
              if (page) {
                // Ensure it's a relative path (security: reject external URLs)
                if (page.startsWith("/")) {
                  router.push(page);
                }
              }
            }
          );
        } catch {
          // PushNotifications plugin not installed — silently skip
        }
      }
    }

    initNative();
  }, [router, toast]);

  return null;
}
