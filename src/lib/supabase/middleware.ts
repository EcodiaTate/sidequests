import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session - this is the only place tokens get refreshed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected (app) route prefixes - redirect to login if not authenticated
  // Note: "/" is the public marketing landing, NOT protected
  const protectedPrefixes = [
    "/home",
    "/quests",
    "/feed",
    "/impact",
    "/wallet",
    "/friends",
    "/teams",
    "/leaderboards",
    "/eco-local",
    "/account",
    "/onboarding",
  ];
  const isAppRoute = protectedPrefixes.some(
    (prefix) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(prefix + "/"),
  );

  if (!user && isAppRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in and hitting auth pages, redirect to app
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup") ||
    request.nextUrl.pathname.startsWith("/forgot-password");

  // /update-password requires an active session (user clicked reset link
  // → callback exchanged code → session exists), so allow authenticated access
  if (
    user &&
    isAuthRoute &&
    !request.nextUrl.pathname.startsWith("/update-password")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
