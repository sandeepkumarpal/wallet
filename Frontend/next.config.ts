import type { NextConfig } from "next";

const backendFromPublicApi = process.env.NEXT_PUBLIC_API_URL?.replace(
  /\/api\/v1\/?$/,
  ""
);

const backendUrl = (
  process.env.BACKEND_URL ||
  backendFromPublicApi ||
  "http://127.0.0.1:5000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.1.16"],
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
