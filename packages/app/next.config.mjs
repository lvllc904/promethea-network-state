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
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: 'crypto-browserify',
                stream: 'stream-browserify',
                url: 'url',
                http: 'stream-http',
                https: 'https-browserify',
                os: 'os-browserify',
                path: 'path-browserify',
                buffer: 'buffer',
            };
        }
        return config;
    },
    async redirects() {
        return [
            {
                source: '/dashboard/citizens',
                destination: '/dashboard/passport',
                permanent: false,
            },
            {
                source: '/dashboard/reports',
                destination: '/dashboard/intel',
                permanent: false,
            },
            {
                source: '/dashboard/founders',
                destination: '/dashboard/founder',
                permanent: false,
            },
        ];
    },
};

export default nextConfig;
