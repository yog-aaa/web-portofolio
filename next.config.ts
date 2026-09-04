import type { NextConfig } from "next";
import { cloudinaryRemotePatterns } from "./lib/config/cloudinary-delivery";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: cloudinaryRemotePatterns({
      CLOUDINARY_URL: process.env.CLOUDINARY_URL,
      CLOUDINARY_FOLDER_ROOT: process.env.CLOUDINARY_FOLDER_ROOT,
    }),
    maximumRedirects: 0,
    dangerouslyAllowSVG: false,
    dangerouslyAllowLocalIP: false,
  },
  async headers() {
    const securityHeaders = [
      { key: "Content-Security-Policy", value: "base-uri 'self'; form-action 'self'; frame-ancestors 'none'; object-src 'none'" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Strict-Transport-Security", value: "max-age=31536000" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
      { source: "/api/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] },
    ];
  },
};

export default nextConfig;
