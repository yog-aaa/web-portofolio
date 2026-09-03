import type { NextConfig } from "next";
import { cloudinaryRemotePatterns } from "./lib/config/cloudinary-delivery";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: cloudinaryRemotePatterns({
      CLOUDINARY_URL: process.env.CLOUDINARY_URL,
      CLOUDINARY_FOLDER_ROOT: process.env.CLOUDINARY_FOLDER_ROOT,
    }),
    maximumRedirects: 0,
    dangerouslyAllowSVG: false,
    dangerouslyAllowLocalIP: false,
  },
};

export default nextConfig;
