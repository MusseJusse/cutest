import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    default: {
      stale: 60 * 60 * 24 * 14, // 14 days
      revalidate: 60 * 60 * 24, // 1 day
      expire: 60 * 60 * 24 * 14, // 14 days
    },
    forever: {
      expire: 999999999,
      revalidate: 999999999,
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Link",
            value: "<https://cdn.jsdelivr.net>; rel=preconnect",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
