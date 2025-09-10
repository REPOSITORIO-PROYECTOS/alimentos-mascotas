import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
  images: {
    // Si usás Cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dfjpi2ypk/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "barker.sistemataup.online",
        port: "",
        pathname: "/**",
      },
    ],
    // 👇 Habilitamos también el backend en tu IP
    domains: ["82.25.69.192", "barker.sistemataup.online"],
  },
};

export default nextConfig;