import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Handle Phaser.js and other dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
      // Alias React Native AsyncStorage (not needed in browser) to a stub
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@react-native-async-storage/async-storage": false,
      };
    }
    return config;
  },
  // Disable Turbopack for now to avoid compatibility issues
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Ensure proper module resolution
  transpilePackages: ['@hashgraph/sdk'],
  // Skip ESLint during production builds to prevent build failures from lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
