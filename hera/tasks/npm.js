const chalk = require('chalk');
const path = require('path');
const fs = require('bluebird').promisifyAll(require('fs'));
const exec = require('../utils/exec');
const inquirer = require('inquirer');
const semver = require('semver');

module.exports = class NpmTask {
  constructor(packages) {
    this.packages = packages;
    this.publish = this.publish.bind(this);
    this.install = this.install.bind(this);
    this.bumpDependencies = this.bumpDependencies.bind(this);
    this.gatherDependencies = this.gatherDependencies.bind(this);
  }
  gatherDependencies(answers) {
    const path1 = path.resolve(this.packages.root, 'package.json');
    console.log(`Gathering all dependencies to ${chalk.yellow(path1)} ...`);
    const dependencies = {};
    const dependencyOrigins = {};
    this.packages.get().forEach(pack => {
      const packageDeps = Object.assign({},
        pack.packageJson.dependencies,
        pack.packageJson.devDependencies
      );
      Object.keys(packageDeps).forEach(key => {
        if (this.packages.filter(x => x.packageName === key).length) return;
        if (!dependencyOrigins[key]) dependencyOrigins[key] = [];
        if (dependencies[key] && dependencies[key] !== packageDeps[key]) {
          if (semver.gt(packageDeps[key].replace('^', '').replace('>', '').replace('=', ''), dependencies[key].replace('^', '').replace('>', '').replace('=', ''))) {
            dependencies[key] = packageDeps[key];
            dependencyOrigins[key].push(`${pack.packageName} (${packageDeps[key]})`);
          }
        } else if (!dependencies[key]) {
          dependencies[key] = packageDeps[key];
          dependencyOrigins[key].push(`${pack.packageName} (${packageDeps[key]})`);
        }
      });
    });
    Object.keys(dependencyOrigins).filter(key => dependencyOrigins[key].length > 1).forEach(key => {
      const arr = dependencyOrigins[key];
      console.log(`Version conflict of ${key} in ${arr.join(', ')}...`);
    });
    return fs.readFileAsync(path1).then(data => {
      const json = JSON.parse(data);
      const final = Object.assign({}, json.dependencies, dependencies);
      json.dependencies = Object.keys(final).sort().reduce((r, k) => {
        r[k] = final[k];
        return r;
      }, {});
      return fs.writeFileAsync(path1, JSON.stringify(json, null, 2));
    }).then(() => answers);
  }
  bumpDependencies(answers) {
    if (!answers) answers = {};
    return inquirer.prompt([
      { type: 'list', name: 'package', when: !answers.package, message: 'Select a project', choices: this.packages.names },
    ]).then(answers2 => Object.assign({}, answers, answers2)).then(answers => {
      const pack = this.packages.get(answers.package);

      console.log(`Updating dependencies of ${chalk.yellow(pack.dir)} ...`);
      return Promise.all(this.packages.map(dependency => {
        console.log(`Bumping to dependency ${chalk.green(dependency.packageName)}@${chalk.green(dependency.version)} ...`);
        return pack.bumpDependency(dependency.packageName, dependency.version);
      })).then(() => answers);
    });
  }
  publish() {
    return inquirer.prompt([
      { type: 'list', name: 'package', message: 'Select a project group', choices: Object.keys(this.packages.groups) },
      { type: 'list', name: 'type', message: 'Select the publish type', choices: ['patch', 'minor', 'major'] },
    ]).then(answers => {
      const bump = pack => exec(`npm version ${answers.type} --force`, pack.dir);
      const publish = pack => exec('npm publish access=public', pack.dir);

      console.log(`Publishing ${chalk.yellow(answers.package)} as ${chalk.green(answers.type)}  ...`);
      return Promise.all(this.packages.groups[answers.package].map(bump))
        .then(() => Promise.all(this.packages.groups[answers.package].map(publish)));
    });
  }
  install() {
    return inquirer.prompt([
      { type: 'input', name: 'name', message: 'Enter a npm package name', default: () => 'all' },
      { type: 'list', name: 'to', message: 'Select a project or all', when: a => a.name === 'all', choices: ['all', ...this.packages.names] },
      { type: 'list', name: 'to', message: 'Select a project or none', when: a => a.name !== 'all', choices: ['none', ...this.packages.names] },
      { type: 'list', name: 'as', message: 'Select type', when: a => a.name !== 'all' && a.to !== 'none', choices: ['--save', '--save-dev'] },
    ]).then(answers => {
      let promise;
      if (answers.name === 'all') {
        const packages = answers.to === 'all'
          ? this.packages.get()
          : [this.packages.get(answers.to)];
        promise = Promise.all([]);
        packages.map(pack => pack.executeWithoutModules(this.packages.names, () => {
          console.log(`Installing dependencies of ${chalk.yellow(pack.dir)} ...`);
          promise.then(exec('npm install', pack.dir));
        }));
      } else if (answers.to === 'none') {
        console.log(`Installing ${chalk.yellow(answers.name)} ...`);
        promise = exec(`npm install ${answers.name}`, this.packages.root);
      } else {
        console.log(`Installing ${chalk.yellow(answers.name)} to ${chalk.cyan(answers.to)} as ${chalk.green(answers.as)} ...`);
        promise = exec(`npm install ${answers.name} ${answers.as}`, this.packages.get(answers.to).dir);
      }
      return promise;
    });
  }
  remove() {
    return inquirer.prompt([
      { type: 'input', name: 'name', message: 'Enter a npm package name' },
      { type: 'list', name: 'to', message: 'Select the project or none', choices: ['none', ...this.packages.names] },
      { type: 'list', name: 'as', message: 'Select type', when: a => a.to !== 'none', choices: ['--save', '--save-dev'] },
    ]).then(answers => {
      if (answers.to === 'none') {
        console.log(`Removing ${chalk.yellow(answers.name)} ...`);
        return exec(`npm remove ${answers.name}`, this.packages.root);
      }
      console.log(`Removing ${chalk.yellow(answers.name)} to ${chalk.cyan(answers.to)} as ${chalk.green(answers.as)} ...`);
      return exec(`npm remove ${answers.name} ${answers.as}`, this.packages.get(answers.to).dir);
    });
  }
};
