import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Removed strict COOP/COEP headers as they block external images (IPTV logos)
};

export default nextConfig;
