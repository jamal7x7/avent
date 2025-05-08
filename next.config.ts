import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Prevent bundling of server-side modules in client-side code
    if (!isServer) {
      console.log("Applying webpack fallbacks for client-side bundle..."); // Diagnostic log
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        "pg-native": false, // often a dependency of pg that causes issues
      };
    }
    return config;
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.githubassets.com" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "api.github.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
} satisfies NextConfig;

export default nextConfig;
