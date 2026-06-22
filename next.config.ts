import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.29.208.1", "172.22.16.1"],
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
