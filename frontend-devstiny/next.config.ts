import type { NextConfig } from "next";

const CLOUDINARY_BASE = "https://res.cloudinary.com/dnr7khgro/image/upload/devstiny";
const ASSET_FOLDERS = ["NPC", "costume", "book", "gem", "scroll", "equip", "base-char", "ui"];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["shiki"],
  },
  async redirects() {
    return ASSET_FOLDERS.map((folder) => ({
      source: `/${folder}/:file+`,
      destination: `${CLOUDINARY_BASE}/${folder}/:file+`,
      permanent: true,
    }));
  },
};

export default nextConfig;
