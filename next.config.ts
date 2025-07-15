import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "basu-lms.fly.storage.tigris.dev",
        port: "",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
