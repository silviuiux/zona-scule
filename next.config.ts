import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // Explicit hostnames only — verified against every host actually present in
    // products / product_listing / categories / subcategories image columns
    // (checked 2026-08-12). A bare '**' wildcard let anyone force Vercel Image
    // Optimization to fetch+transform arbitrary external images at our cost.
    remotePatterns: [
      { protocol: 'https', hostname: 'dfbhgnbqwoinujnzfxsl.supabase.co' },
      { protocol: 'https', hostname: 'assets.pferd.com' },
      { protocol: 'https', hostname: 'assets.ffgroup-toolindustries.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'milwaukee-media-images.s3.amazonaws.com' },
      { protocol: 'https', hostname: 'static.milwaukeetool.eu' },
      { protocol: 'https', hostname: 'www.milwaukeetool.com' },
      { protocol: 'https', hostname: 'novaliaromania.ro' },
      { protocol: 'https', hostname: 'www.novaliaromania.ro' },
      { protocol: 'https', hostname: 's1.kaercher-media.com' },
      { protocol: 'https', hostname: 'www.osborn.com' },
      { protocol: 'https', hostname: 'ddr456.saas.contentserv.com' },
      { protocol: 'https', hostname: 'www.krause-systems.co.uk' },
      { protocol: 'https', hostname: 'www.krause-systems.de' },
      { protocol: 'https', hostname: 'krausenagyker.hu' },
      { protocol: 'https', hostname: 'www.scule.ro' },
      { protocol: 'https', hostname: 'toya24.ro' },
      { protocol: 'https', hostname: 'big.store.ro' },
      { protocol: 'https', hostname: 'cdn.idealo.com' },
      { protocol: 'https', hostname: 'mateomarket.pl' },
      { protocol: 'https', hostname: 'www.leborgne.fr' },
      { protocol: 'https', hostname: 'www.universalconstruct.ro' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'www.boschtools.com' },
      { protocol: 'https', hostname: 'www.bosch-professional.com' },
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
    ],
    // Only generate the breakpoints we actually request via `sizes=` in the app
    // (ProductCard: ~380px/50vw, Nav: 52px, Gallery: 33vw/90vw, Hero: 50vw/100vw)
    // instead of Next's default 8x5 grid — cuts unique transformations per image.
    deviceSizes: [384, 640, 828, 1080, 1920],
    imageSizes: [52, 96, 192, 384],
    // Product images rarely change; avoid re-transforming on every request.
    // Default is 60s, which meant any traffic after the first minute re-triggered
    // optimization + a fresh cache write.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
