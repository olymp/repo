const fs = require('fs');
const path = require('path');
const semver = require('semver');
const promisify = require('bluebird').promisify;
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

module.exports = class Package {
  constructor(packageJsonPath, parentName) {
    const packageJson = require(packageJsonPath);

    this._packageJson = packageJson;
    this._name = parentName ? `${parentName}/${packageJson.name}` : packageJson.name;
    this._parent = parentName;
    this._dir = path.dirname(packageJsonPath);

    const hera = fs.existsSync(this.resolve('.hera'))
      ? JSON.parse(fs.readFileSync(this.resolve('.hera')))
      : {};
    this._hera = hera;

    if (hera && hera.webpack) {
      this._config = hera.webpack
        ? require(this.resolve(hera.webpack))()
        : {};
      if (this._config) {
        this._config = Object.assign({}, this._config, (this._config[process.env.NODE_ENV] || {}));
      }
    }

    this.bump = this.bump.bind(this);
    this.bumpDependency = this.bumpDependency.bind(this);
    this.executeWithoutModules = this.executeWithoutModules.bind(this);
    this.writePkgJson = this.writePkgJson.bind(this);
    this.pkgJsonStrip = this.pkgJsonStrip.bind(this);
    this.pkgJsonBackup = this.pkgJsonBackup.bind(this);
    this.pkgJsonRestore = this.pkgJsonRestore.bind(this);
    this.pkgJsonRemoveBackup = this.pkgJsonRemoveBackup.bind(this);
  }
  get isApp() { return this._hera.type === 'app'; }
  get isModule() { return this._hera.type !== 'app'; }
  get config() { return this._config; }
  get hera() { return this._hera; }
  get dir() { return this._dir; }
  get name() { return this._name; }
  get packageJson() { return this._packageJson; }
  get packageName() { return this._packageJson.name; }
  get version() { return this._packageJson.version; }
  get parent() { return this._parent; }
  resolve(...args) { return path.resolve(this.dir, ...args); }

  // Package JSON
  bump(type, modules) {
    this._packageJson.version = semver(this._packageJson.version, type);
    return this.writePkgJson();
  }
  bumpDependency(module, version) {
    this._packageJson = mapDependencies(this._packageJson, dependencies => {
      if (dependencies[module]) return Object.assign(dependencies, { [module]: `^${version}` });
      return dependencies;
    });

    return this.writePkgJson();
  }
  executeWithoutModules(modules, promise) {
    return this.pkgJsonBackup()
      .then(x => this.pkgJsonStrip(modules))
      .then(promise)
      .then(this.pkgJsonRestore)
      .then(this.pkgJsonRemoveBackup)
      .catch(err => this.pkgJsonRestore().then(this.pkgJsonRemoveBackup).then(() => { throw err; }));
  }
  writePkgJson() {
    return writeFile(this.resolve('package.json'), JSON.stringify(this._packageJson, null, 2));
  }
  pkgJsonStrip(modules) {
    let content = JSON.parse(JSON.stringify(this.packageJson));
    for (const module of modules) {
      content = mapDependencies(content, dependencies => {
        delete dependencies[module];
        return dependencies;
      });
    }
    return writeFile(this.resolve('package.json'), JSON.stringify(content, null, 2));
  }
  pkgJsonBackup() {
    if (!fs.existsSync(this.resolve('package-backup.json'))) {
      return writeFile(this.resolve('package-backup.json'), JSON.stringify(this.packageJson, null, 2));
    } return Promise.all([]);
  }
  pkgJsonRestore() {
    return writeFile(this.resolve('package.json'), JSON.stringify(this.packageJson, null, 2));
  }
  pkgJsonRemoveBackup() {
    return unlink(this.resolve('package-backup.json'));
  }
};

let mapDependencies = (oldContent, fn) => {
  const content = JSON.parse(JSON.stringify(oldContent));
  const dependencyTypes = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'bundleDependencies',
  ];
  for (const type of dependencyTypes) {
    if (content[type]) {
      const newContent = fn(content[type]);
      if (newContent) content[type] = newContent;
    }
  } return content;
};
