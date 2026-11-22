module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@common': './src/common',
          '@services': './src/services',
          '@assets': './src/assets',
          '@locales': './src/locales',
          '@models': './src/models',
          '@components': './src/components',
          '@pages': './src/pages',
          '@store': './src/store',
          '@animations': './src/animations',
          '@utils': './src/utils',
        },
      },
    ],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
};