import type {NextConfig} from 'next';
import optimizeLocales from '@react-aria/optimize-locales-plugin';

const localeOptimization = optimizeLocales.turbopack([
  {condition: {not: 'browser'}, locales: ['en', 'de']},
  {condition: 'browser', locales: []}
]);

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      },
      ...localeOptimization.rules
    }
  }
};

export default nextConfig;
