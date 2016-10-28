var child_process = require('child_process');

module.exports = (command, cwd, silent) => {
  return new Promise((yay, nay) => {
    var exec = child_process.exec(command, {
      cwd: cwd,
      stdio: [
        0, // use parents stdin for child
        1, // use parent's stdout stream - IMPORTANT if we dont do this things like the spinner will break the automation.
        2  // fs.openSync('err.out', 'w') // direct child's stderr to a file
      ]
    }, (error, stdout, stderr) => {
      if (error) nay(error);
      else yay(stdout);
    });
    exec.stdout.on('data', data => console.log(data));
    exec.stdout.pipe(process.stdout);
  })
};
