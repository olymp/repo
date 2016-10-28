const path = require('path');
const glob = require('glob');
const Pkg = require('./package');

module.exports = class Packages {
  constructor(packages = [], rootPath = '') {
    this.dictionary = {};
    this.array = [];
    this.rootPath = rootPath;
    this.filter = this.filter.bind(this);
    this.get = this.get.bind(this);
    this.map = this.map.bind(this);

    packages.forEach(pack => {
      const root = glob.sync(path.join(pack, 'package.json'), { cwd: rootPath });
      const children = glob.sync(path.join(pack, '*', 'package.json'), { cwd: rootPath });

      [...root, ...children].forEach(pkgJsonPathRelative => {
        const pkgJsonPath = path.resolve(rootPath, pkgJsonPathRelative);

        const parent = root.length > 0 && root[0] !== pkgJsonPathRelative ? root[0] : null;
        const parentName = parent ? require(path.resolve(rootPath, pack, 'package.json')).name : null;

        const pkg = new Pkg(pkgJsonPath, parentName);
        this.dictionary[pkg.name] = pkg;
        this.dictionary[pkg.packageName] = pkg;
        this.array.push(pkg);
      });
    });
  }
  get root() { return this.rootPath; }
  get node_modules() { return path.resolve(this.rootPath, 'node_modules'); } // eslint-disable-line

  get packages() { return this.array; }
  get names() { return this.array.map(x => x.name); }
  get dirs() { return this.array.map(x => x.dir); }
  get groups() {
    const modules = {};
    this.array.forEach(x => {
      const name = x.packageName.split('-')[0];
      if (!modules[name]) modules[name] = [];
      modules[name].push(x);
    });
    return modules;
  }

  filter(fc) { return this.array.filter(fc); }
  get(key) { return !key ? this.array : this.dictionary[key]; }
  map(...args) { return typeof args[0] === 'function' ? this.array.map(args[0]) : this.array.map(x => x.resolve(...args)) }
}
