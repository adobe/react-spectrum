module.exports = {
  presets: [
    '@babel/preset-typescript',
    '@babel/preset-react',
    '@babel/preset-env'
  ],
  env: {
    storybook: {
      presets: [
        '@babel/preset-typescript',
        '@babel/preset-react',
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'usage',
            corejs: 2
          }
        ]
      ]
    },
    test: {
      plugins: ["@babel/plugin-transform-runtime"],
      presets: [
        '@babel/preset-typescript',
        '@babel/preset-react',
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry',
            corejs: 2
          }
        ]
      ]
    },
    cover: {
      plugins: ['istanbul']
    }
  },
  plugins: [
    ['@babel/plugin-proposal-decorators', {legacy: true}],
    ['@babel/plugin-proposal-class-properties', {loose: false}],
    '@babel/plugin-proposal-export-default-from',
    '@babel/plugin-proposal-export-namespace-from',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-transform-async-to-generator',
    'react-docgen',
    'transform-glob-import',
    'babel-plugin-macros',
    './bin/import-css.js'
  ],
  sourceType: 'unambiguous'
};
