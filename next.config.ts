import type { NextConfig } from "next";

const CORE_API_HOST = process.env.NEXT_PUBLIC_CORE_API_HOST || "rail-sangwari.vercel.app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // If accessed via a dedicated Sahayak domain (e.g. sahayak-sangwari.vercel.app or rail-sahayak.vercel.app)
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
        // Proxy API calls on the sahayak domain back to the core database on rail-sangwari so both projects share unified data
        {
          source: "/api/:path*",
          has: [
            {
              type: "host",
              value: "(?<prefix>.*)sahayak(?<suffix>.*)",
            },
          ],
          destination: `https://${CORE_API_HOST}/api/:path*`,
        },
        {
          source: "/api/:path*",
          has: [
            {
              type: "host",
              value: "(?<prefix>.*)supervisor(?<suffix>.*)",
            },
          ],
          destination: `https://${CORE_API_HOST}/api/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
