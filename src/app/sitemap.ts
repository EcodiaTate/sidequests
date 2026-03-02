import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sidequests.ecodia.co";
  const now = new Date();

  return [
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 1 },
  ];
}
