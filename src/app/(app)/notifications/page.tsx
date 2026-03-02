import { getNotifications } from "@/lib/actions/notifications";
import { NotificationsClient } from "@/components/domain/notifications/notifications-client";

export const metadata = {
  title: "Notifications — Ecodia",
};

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  return (
    <div className="container-page py-4 max-w-2xl mx-auto">
      <h1 className="text-fluid-xl uppercase mb-4">Notifications</h1>
      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
