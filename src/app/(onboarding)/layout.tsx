import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // If user already completed onboarding, send them to the app
  const { data: profile } = await supabase
    .from("profiles")
    .select("legal_onboarding_complete")
    .eq("id", user.id)
    .single();

  if (profile?.legal_onboarding_complete) {
    redirect("/home");
  }

  return (
    <div
      className="ios-fill flex items-center justify-center bg-canopy"
      style={{ padding: "var(--space-4)" }}
    >
      <div className="w-full max-w-lg">
        {/* Branding */}
        <div className="text-center mb-6">
          <h1 className="text-fluid-2xl text-gradient-eco">ecodia</h1>
          <p className="t-muted text-fluid-sm mt-1">
            Let&apos;s get you set up
          </p>
        </div>

        <div className="card pad-4">{children}</div>
      </div>
    </div>
  );
}
