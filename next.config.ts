import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dfbhgnbqwoinujnzfxsl.supabase.co' },
      { protocol: 'https', hostname: 'milwaukee-media-images.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'assets.pferd.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'novaliaromania.ro' },
      { protocol: 'https', hostname: 'www.novaliaromania.ro' },
      { protocol: 'https', hostname: 'www.krause-systems.co.uk' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
