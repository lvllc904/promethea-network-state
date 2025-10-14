
import type {NextConfig} from 'next';

const isStaticExport = !!process.env.NEXT_STATIC_EXPORT;

const nextConfig: NextConfig = {
  /* config options here */
  // Add the output property for static exports
  output: isStaticExport ? 'export' : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // For static exports, we need to disable the default image optimization.
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
