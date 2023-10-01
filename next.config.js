const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@eversdk/lib-web"],
  webpack(config) {
    config.output.webassemblyModuleFilename = "./public/eversdk.wasm";
    config.experiments = { asyncWebAssembly: true, layers: true };
    return config;
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    minimumCacheTTL: 1500000,
  },
};

module.exports = nextConfig;
