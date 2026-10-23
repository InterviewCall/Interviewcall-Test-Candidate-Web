import type { NextConfig } from "next";

// Where the NestJS API listens. The browser never talks to it directly: every /api/* request
// goes to this app first and is forwarded, which keeps the test session cookie first-party
// and needs no CORS.
const apiOrigin = (process.env.API_ORIGIN ?? "http://localhost:4000").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${apiOrigin}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/((?!_next/static|_next/image|images/|favicon.ico).*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // The invite link carries a secret in its path, so it must never leak in a Referer.
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
