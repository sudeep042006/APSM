// Next.js configuration file
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Set workspace root to frontend dir to suppress lockfile warnings */
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
