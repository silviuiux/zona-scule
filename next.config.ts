import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage
      { protocol: 'https', hostname: 'dfbhgnbqwoinujnzfxsl.supabase.co' },
      // Milwaukee
      { protocol: 'https', hostname: 'milwaukee-media-images.s3.amazonaws.com' },
      // PFERD
      { protocol: 'https', hostname: 'assets.pferd.com' },
      // Cloudinary (RUKO)
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // Novalia
      { protocol: 'https', hostname: 'novaliaromania.ro' },
      { protocol: 'https', hostname: 'www.novaliaromania.ro' },
      // Krause / SCARI
      { protocol: 'https', hostname: 'www.krause-systems.co.uk' },
      // Any other S3 bucket
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      // Generic fallback for any https image
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
