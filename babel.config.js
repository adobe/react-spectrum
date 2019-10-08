module.exports = {
  presets: [
    '@babel/preset-typescript',
    '@babel/preset-react',
    '@parcel/babel-preset-env'
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
            corejs: 3
          }
        ]
      ]
    },
    test: {
      plugins: ['@babel/plugin-transform-runtime'],
      presets: [
        '@babel/preset-typescript',
        '@babel/preset-react',
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'entry',
            corejs: 3
          }
        ]
      ]
    },
    cover: {
      plugins: ['istanbul']
    },
    production: {
      plugins: [
        ['react-remove-properties', {'properties': ['data-testid']}]
      ]
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
    'transform-glob-import',
    'babel-plugin-macros'
  ],
  sourceType: 'unambiguous'
};
