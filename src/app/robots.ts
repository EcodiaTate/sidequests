import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sidequests.ecodia.co";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/account/*",
          "/home",
          "/quests",
          "/feed",
          "/impact",
          "/wallet",
          "/friends",
          "/teams",
          "/leaderboards",
          "/onboarding",
          "/login",
          "/signup",
          "/forgot-password",
          "/update-password",
          "/verify-email",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
