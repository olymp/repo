const chalk = require('chalk');
const path = require('path');
const fs = require('bluebird').promisifyAll(require('fs'));

function existsAsync(path) {
  return new Promise(resolve => {
    fs.exists(path, resolve);
  });
}

module.exports = class GeneralTask {
  constructor(packages) {
    this.packages = packages;
    this.init = this.init.bind(this);
  }
  init() {
    return Promise.all(this.packages.map(pack => {
      const path1 = path.resolve(this.packages.node_modules, pack.packageName);
      console.log(`Initializing ${chalk.cyan(path1)} ...`);
      return existsAsync(pack.resolve('.hera')).then(exists => {
        if (exists) return fs.readFileAsync(pack.resolve('.hera'));
        return JSON.stringify({});
      }).then(content => {
        const json = JSON.parse(content);
        json.root = path.resolve(this.packages.root);
        return fs.writeFileAsync(pack.resolve('.hera'), JSON.stringify(json));
      });
    }));
  }
};
