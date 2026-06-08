import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow:    ["/"],
      disallow: ["/admin/", "/path/", "/quests/", "/shop/", "/forum/"],
    },
    sitemap: "https://devstiny.com/sitemap.xml",
  };
}
