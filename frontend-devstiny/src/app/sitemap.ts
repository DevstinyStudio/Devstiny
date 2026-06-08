import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url:             "https://devstiny.com",
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        1.0,
    },
    {
      url:             "https://devstiny.com/whats-new",
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.7,
    },
    {
      url:             "https://devstiny.com/books",
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.8,
    },
  ];
}
