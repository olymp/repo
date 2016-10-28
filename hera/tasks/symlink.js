const path = require('path');
const chalk = require('chalk');
const exec = require('../utils/exec');

module.exports = class SymlinkTask {
  constructor(packages) {
    this.packages = packages;
    this.linkModules = this.linkModules.bind(this);
    this.linkPackages = this.linkPackages.bind(this);
    this.link = this.link.bind(this);
    this.unlink = this.unlink.bind(this);
  }
  linkModules() {
    return Promise.all(this.packages.filter(x => x.linkModules !== false).map(pack => {
      const path1 = pack.resolve('node_modules');
      const path2 = this.packages.node_modules;
      console.log(`Linking node_modules ${chalk.yellow(path1)}/ to ${chalk.cyan(path2)}/ ...`);
      return exec(`ln -s -f ${path2}/ ${pack.dir}/`);
    }));
  }
  linkPackages() {
    return Promise.all(this.packages.filter(x => x.linkPackages !== false).map(pack => {
      const path1 = path.resolve(this.packages.node_modules, pack.packageName);
      console.log(`Linking module ${chalk.cyan(path1)} to ${chalk.yellow(pack.dir)} ...`);
      return exec(`rm -rf -f ${path1}`).then(() => exec(`ln -s -f ${pack.dir} ${path1}`));
    }));
  }
  link() {
    return this.linkModules().then(this.linkPackages);
  }
  unlink() {
    return exec(`find ${this.packages.node_modules} -maxdepth 1 -type l -exec rm -f {} \;`);
  }
};
