import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  experimental: {
    // Optimize package imports for better tree-shaking and faster builds
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
