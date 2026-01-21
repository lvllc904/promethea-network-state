/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        '@promethea/lib',
        '@promethea/components',
        '@promethea/ai',
        '@promethea/firebase',
        '@promethea/hooks',
        '@promethea/ui',
        '@promethea/pubsub'
    ],
    // Removed unsupported serverExternalPackages option (not valid in Next.js config).
    experimental: {},
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;
