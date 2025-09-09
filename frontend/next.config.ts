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
    ],
    // 👇 Habilitamos también el backend en tu IP
    domains: ["82.25.69.192"],
  },
};

export default nextConfig;