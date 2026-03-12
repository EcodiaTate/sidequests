import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileProvider } from "@/lib/hooks/use-profile";
import { ToastProvider } from "@/components/ui/toast";
import { NativeInitializer } from "@/components/native/NativeInitializer";
import { DockShell } from "@/components/layout/dock-shell";
import { DockRail } from "@/components/layout/dock-rail";
import { NAV_ITEMS, MOBILE_TAB_KEYS } from "@/lib/constants/navigation";
import { getUnreadCount } from "@/lib/actions/notifications";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch profile (auto-created by DB trigger on signup)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  // Legal onboarding gate - new users must complete onboarding first
  if (!profile.legal_onboarding_complete) {
    redirect("/onboarding");
  }

  // Fetch unread notification count for the sidebar badge
  const unreadNotifications = await getUnreadCount();

  // Filter nav items: mobile gets 5 primary tabs, desktop gets all (admin conditionally)
  const mobileItems = NAV_ITEMS.filter((i) =>
    MOBILE_TAB_KEYS.includes(i.key)
  );
  const railItems = NAV_ITEMS.filter(
    (i) => !i.adminOnly || profile.is_admin
  );

  return (
    <ProfileProvider initialProfile={profile}>
      <ToastProvider>
        <NativeInitializer />
        <div className="ios-fill flex">
          <DockRail
            items={railItems}
            profile={profile}
            unreadNotifications={unreadNotifications}
          />

          <main className="flex-1 scroll-native min-h-screen-dvh pb-tab-bar lg:pb-safe">
            {children}
          </main>

          <DockShell items={mobileItems} />
        </div>
      </ToastProvider>
    </ProfileProvider>
  );
}
