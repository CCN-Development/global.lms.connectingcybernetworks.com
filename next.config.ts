import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    reactCompiler: true,
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "cdn.connectingcybernetwork.com" },
            { protocol: "https", hostname: "cdn.connectingcybernetworks.com" },
        ],
    },
};

export default nextConfig;