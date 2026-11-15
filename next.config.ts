import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // If accessed via a dedicated Sahayak domain (e.g. rail-sahayak.vercel.app or sahayak.*)
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "(?<prefix>.*)sahayak(?<suffix>.*)",
          },
        ],
        destination: "/sahayak",
      },
      // If accessed via a dedicated Supervisor domain (e.g. rail-supervisor.vercel.app or supervisor.*)
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "(?<prefix>.*)supervisor(?<suffix>.*)",
          },
        ],
        destination: "/supervisor",
      },
    ];
  },
};

export default nextConfig;
