import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-4210e4c0-2cc4-4d88-b078-d7b24537abbb.space-z.ai",
    ".space-z.ai",
    ".space.chatglm.site",
  ],
};

export default nextConfig;
