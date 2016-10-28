const appRoot = require('app-root-dir');
const bluebird = require('bluebird');
const webpack = bluebird.promisify(require('webpack'));
appRoot.set(__dirname);

webpack(require('@olymp/zeus/tools/webpack/client.config.js')()).then((stats) => {
  return webpack(require('@olymp/zeus/tools/webpack/universalMiddleware.config.js')());
}).then((stats) => {
  return webpack(require('@olymp/zeus/tools/webpack/server.config.js')());
}).catch(err => console.error(err));


