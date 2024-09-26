import macrosPlugin from 'unplugin-parcel-macros';

// Create a single instance of the plugin that's shared between server and client builds.
let macrosWebpack = macrosPlugin.webpack();

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, {}) {
    config.plugins.push(macrosWebpack);

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  }
};

export default nextConfig;
