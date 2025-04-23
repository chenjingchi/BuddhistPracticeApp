module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: [
          '.ios.js',
          '.android.js',
          '.js',
          '.json',
        ],
        alias: {
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@contexts': './src/contexts',
          '@hooks': './src/hooks',
          '@constants': './src/constants',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
