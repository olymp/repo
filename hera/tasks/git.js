const chalk = require('chalk');
const exec = require('../utils/exec');
const execAndRead = require('../utils/exec-and-read');
const inquirer = require('inquirer');

module.exports = class GitTask {
  constructor(packages) {
    this.packages = packages;
    this.push = this.push.bind(this);
  }
  push(answers) {
    if (!answers) answers = {};
    return inquirer.prompt([
      { type: 'list', when: !answers.package, name: 'package', message: 'Select a project', choices: this.packages.names},
    ]).then(answers2 => Object.assign({}, answers2, answers)).then(answers => {
      var pack = this.packages.get(answers.package);
      return execAndRead('git remote', pack.dir).then(options => Object.assign(answers, { options }));
    }).then(answers => {
      answers.options = answers.options.split('\n').map(x => x.trim()).filter(x => x);
      if (answers.options.length === 1) return Object.assign({}, answers, {remote: answers.options[0]});
      if (answers.options.indexOf('origin') !== -1) answers.options = ['origin'].concat(answers.options.filter(x => x !== 'origin'));
      answers.options.push('all');
      return inquirer.prompt([
        { type: 'list', name: 'remote', message: 'Select a remote', choices: answers.options }
      ]).then(x => Object.assign(answers, x));
    }).then(answers => {
      var pack = this.packages.get(answers.package);
      console.log(`Pushing ${chalk.yellow(pack.dir)} to ${chalk.green(answers.remote)}  ...`);
      return exec(`git push ${answers.remote} master`, pack.dir).then(x => answers);
    });
  }
};
