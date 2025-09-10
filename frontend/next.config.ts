import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dfjpi2ypk/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "barker.sistemataup.online",
        pathname: "/**",
      },
      {
        protocol: "http", // 👈 tu backend local usa http, no https
        hostname: "82.25.69.192",
        port: "8080", // 👈 puerto explícito
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;