import type { NextConfig } from "next";
import path from "path";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Explicit allow-list only — the previous '**' wildcard let anyone use
    // this site's /_next/image optimizer as a free proxy for any URL.
    remotePatterns: [
      { protocol: 'https', hostname: 'dfbhgnbqwoinujnzfxsl.supabase.co' },
      { protocol: 'https', hostname: 'milwaukee-media-images.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'assets.pferd.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'novaliaromania.ro' },
      { protocol: 'https', hostname: 'www.novaliaromania.ro' },
      { protocol: 'https', hostname: 'www.krause-systems.co.uk' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
