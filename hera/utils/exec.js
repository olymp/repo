var child_process = require('child_process');

var exec = function(cmd, cwd, callback) {
  var split = cmd.split(' ');
  var command = split[0];
  split.shift();
  var child = child_process.spawn(command, split, {
    cwd: cwd,
    stdio: [
      0, // use parents stdin for child
      1, // use parent's stdout stream - IMPORTANT if we dont do this things like the spinner will break the automation.
      2  // fs.openSync('err.out', 'w') // direct child's stderr to a file
    ]
  });
  if (callback) {
    var data = '';
    if (child.stdout) {
      child.stdout.on('data', function(x) {
        data = data + x;
      });
    }
    child.on('close', error => {
      callback(error, data);
    });
  }
  return child;
};

module.exports = (command, cwd, silent) => {
  return new Promise((yay, nay) => {
    exec(command, cwd, (error, data) => {
      if (!!error) nay(error);
      else yay(data);
    });
  });
};

/*

 import child_process from 'child_process';
 var exec = function(cmd, cwd, callback) {
 var split = cmd.split(' ');
 var command = split[0];
 split.shift();
 var child = child_process.spawn(command, split, {
 cwd: cwd,
 stdio: [
 0, // use parents stdin for child
 1, // use parent's stdout stream - IMPORTANT if we dont do this things like the spinner will break the automation.
 2  // fs.openSync('err.out', 'w') // direct child's stderr to a file
 ]
 });
 if (callback) {
 child.on('close', function() {
 callback.apply(null, arguments);
 });
 }
 return child;
 };
 export default (command, cwd, silent) => {
 return new Promise((yay, nay) => {
 var commands = Array.isArray(command) ? command : [command];
 var firstCommand = commands[0];
 commands.shift();
 console.log(firstCommand, commands);
 exec(firstCommand, {cwd}, (error, stdout, stderr) => {
 console.log('done', !!error, stdout);
 if (!!error) nay(error);
 else yay(stdout);
 });
 for (var com of commands){
 exec.stdout.pipe(exec(com, cwd));
 }
 });
 };


 */
