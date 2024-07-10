const localesPlugin = require('@react-aria/optimize-locales-plugin');
const glob = require('glob');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      // Don't include any locale strings in the client JS bundle.
      config.plugins.push(localesPlugin.webpack({ locales: [] }));
    }
    return config;
  },
  transpilePackages: [
    '@adobe/react-spectrum',
    '@react-spectrum/*',
    '@spectrum-icons/*',
  ].flatMap(spec => glob.sync(`${spec}`, { cwd: 'node_modules/' })),
}

module.exports = nextConfig
