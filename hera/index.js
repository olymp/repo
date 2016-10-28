const BuildTask = require('./tasks/build');
const SymlinkTask = require('./tasks/symlink');
const NpmTask = require('./tasks/npm');
const GeneralTask = require('./tasks/general');
const GitTask = require('./tasks/git');
const Packages = require('./packages');
const fs = require('fs');
const path = require('path');

const getDefaultOptions = options => {
  const newOptions = Object.assign({}, options);
  if (!newOptions.root) newOptions.root = process.cwd();
  const configPath = path.resolve(newOptions.root, 'heraconfig.json');
  /* eslint-disable global-require */
  if (!newOptions.config && fs.existsSync(configPath)) newOptions.config = require(configPath);
  /* eslint-disable */
  if (!newOptions.config) newOptions.config = {};
  return newOptions;
}

module.exports = (options) => {
  const newOptions = getDefaultOptions(options);
  const packages = new Packages(newOptions.config.packages, newOptions.root);
  const buildTask = BuildTask(packages);
  const symlinkTask = new SymlinkTask(packages);
  const gitTask = new GitTask(packages);
  const npmTask = new NpmTask(packages);
  const generalTask = new GeneralTask(packages);
  const tasks = {
    // Build
    init: generalTask.init,
    build: buildTask.build,
    watch: () => buildTask.build().then(buildTask.watch).catch(err => console.error(err)),
    // Symlinks
    unlink: symlinkTask.unlink,
    link: () => generalTask.init()
      .then(symlinkTask.unlink)
      .then(symlinkTask.link)
      .then(npmTask.gatherDependencies)
      .catch(err => console.error(err, err.stack)),
    // Git
    push: gitTask.push,
    // Npm
    publish: opt => npmTask.bumpDependencies(opt).then(buildTask.build).then(npmTask.publish).catch(err => console.error(err)),
    install: opt => symlinkTask.unlink(opt).then(npmTask.install).then(symlinkTask.link).catch(err => console.error(err)),
    remove: opt => symlinkTask.unlink(opt).then(npmTask.remove).then(symlinkTask.link),
    // More
    deploy: opt => npmTask.bumpDependencies(opt).then(buildTask.webpack).then(gitTask.push).catch(err => console.error(err))
  }
  return {
    execute: (command, options) => tasks[command](options),
    tasks
  }
}
