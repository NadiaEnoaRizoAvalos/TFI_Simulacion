import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.29.208.1", "172.22.16.1"],
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
