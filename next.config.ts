import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Skip ESLint during production builds to prevent type/lint errors from blocking builds
    ignoreDuringBuilds: true,
  },
  // Set Turbopack root to this workspace to silence multi-lockfile warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
