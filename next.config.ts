import type { NextConfig } from "next";

// Only use static export when building for Electron production
const isElectronBuild = process.env.ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  // Static export for Electron production, normal mode for development
  ...(isElectronBuild && { output: 'export' }),
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  // Removed strict COOP/COEP headers as they block external images (IPTV logos)
  // Electron handles SharedArrayBuffer natively without these headers when configured correctly.
};

export default nextConfig;
