import type { MetadataRoute } from "next";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface BlogEntry {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
}

async function getBlogSlugs(): Promise<BlogEntry[]> {
  try {
    const res = await fetch(`${API}/blog`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()) as BlogEntry[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogSlugs();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url:             `https://www.devstiny.com/blog/${post.slug}`,
    lastModified:    post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "monthly",
    priority:        0.7,
  }));

  return [
    {
      url:             "https://www.devstiny.com",
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        1,
    },
    {
      url:             "https://www.devstiny.com/whats-new",
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    },
    {
      url:             "https://www.devstiny.com/books",
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.7,
    },
    {
      url:             "https://www.devstiny.com/blog",
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.8,
    },
    ...blogEntries,
  ];
}
