const req = require('./utils/get-module-path');

module.exports = options => ({
  sourceMaps: 'inline',
  presets: [
    options && options.es6 ? req('babel-preset-es2015-native-modules') : req('babel-preset-es2015'),
    req('babel-preset-react'),
    req('babel-preset-stage-0'),
    req('babel-preset-react-optimize'),
  ],
  plugins: [
    req('babel-plugin-transform-object-rest-spread'),
    req('babel-plugin-transform-es2015-destructuring'),
    req('babel-plugin-transform-class-properties'),
    req('babel-plugin-add-module-exports'),
    req('babel-plugin-transform-decorators-legacy'),
    req('babel-plugin-transform-flow-strip-types'),
    [
      req('babel-plugin-transform-runtime'), {
        polyfill: false,
        regenerator: true,
      },
    ],
  ],
});
