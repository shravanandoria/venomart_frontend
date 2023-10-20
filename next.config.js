const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "https://alivegamers.com/assets/" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  reactStrictMode: true,
  transpilePackages: ["@eversdk/lib-web"],
  webpack(config) {
    // config.output.webassemblyModuleFilename = "./public/eversdk.wasm";
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
