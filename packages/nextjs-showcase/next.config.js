/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fhevm-sdk'],
  
  // CORS headers for FHEVM WebAssembly (必需)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
  
  // Webpack配置：忽略Node.js模块和React Native依赖
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        '@react-native-async-storage/async-storage': false,
        'pino-pretty': false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    config.ignoreWarnings = [
      { module: /@metamask\/sdk/ },
      { module: /@react-native-async-storage/ },
      { module: /pino-pretty/ },
    ];
    
    return config;
  },
};

module.exports = nextConfig;

