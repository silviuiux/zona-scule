import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product/category/brand imagery lives in Supabase Storage (public
    // bucket). We deliberately don't allow arbitrary remote hosts (e.g. raw
    // manufacturer image URLs) so next/image optimization stays on — no
    // `unoptimized` flag, per the fix called out in REBUILD.md §3.7. Assets
    // that haven't been migrated to Storage yet fall back to a placeholder
    // instead of hotlinking an unknown third-party domain.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dfbhgnbqwoinujnzfxsl.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
