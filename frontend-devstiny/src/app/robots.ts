import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/profile/", "/whats-new", "/books"],
        disallow: [
          "/admin/",
          "/path/",
          "/quests/",
          "/shop/",
          "/forum/",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: "https://www.devstiny.com/sitemap.xml",
  };
}
