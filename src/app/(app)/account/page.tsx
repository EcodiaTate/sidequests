import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";
import { User, Lock, Palette, AlertTriangle, LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { SettingsNavCard } from "@/components/domain/account/settings-nav-card";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="container-page py-4 flex flex-col gap-fluid-4 max-w-lg mx-auto">
      {/* Profile header */}
      <div className="flex items-center gap-3">
        <Avatar
          src={profile?.avatar_url}
          alt={profile?.display_name ?? "User"}
          size="lg"
          fallback={profile?.display_name ?? "?"}
        />
        <div className="min-w-0">
          <h2 className="text-fluid-lg uppercase truncate">
            {profile?.display_name || "User"}
          </h2>
          <p className="t-muted text-fluid-sm truncate">
            {user?.email}
          </p>
          {profile?.role && (
            <Chip variant="primary" className="mt-1">
              {profile.role}
            </Chip>
          )}
        </div>
      </div>

      {/* Navigation cards */}
      <nav className="flex flex-col gap-2">
        <SettingsNavCard
          icon={User}
          label="Edit profile"
          href="/account/profile"
        />
        <SettingsNavCard
          icon={Lock}
          label="Change password"
          href="/account/password"
        />
        <SettingsNavCard
          icon={Palette}
          label="Appearance"
          href="/account/appearance"
        />
        <SettingsNavCard
          icon={AlertTriangle}
          label="Delete account"
          href="/account/delete"
          variant="danger"
        />
      </nav>

      {/* Sign out */}
      <form action={signOut}>
        <Button
          variant="tertiary"
          fullWidth
          type="submit"
          icon={<LogOut className="w-4 h-4" />}
        >
          Sign out
        </Button>
      </form>
    </div>
  );
}
