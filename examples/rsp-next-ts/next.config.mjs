import localesPlugin from '@react-aria/optimize-locales-plugin';
import {glob} from 'glob';

export default {
  transpilePackages: [
    '@adobe/react-spectrum',
    '@react-spectrum/*',
    '@spectrum-icons/*'
  ].flatMap(spec => glob.sync(`${spec}`, { cwd: 'node_modules/' })),
  basePath:
    process.env.VERDACCIO && process.env.CIRCLE_SHA1
      ? `/reactspectrum/${process.env.CIRCLE_SHA1}/verdaccio/next`
      : "",
  webpack(config, { isServer }) {
    if (!isServer) {
      config.plugins.push(localesPlugin.webpack({ locales: [] }));
    }
    return config;
  }
};
