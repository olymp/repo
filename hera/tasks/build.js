const plumber = require('gulp-plumber');
const through = require('through2');
const chalk = require('chalk');
const newer = require('gulp-newer');
const gulpWatch = require('gulp-watch');
const gutil = require('gulp-util');
const gulp = require('gulp');
const gulpBabel = require('../utils/gulp-babel');

const babel = packages => {
  const babelConfig = require('../babelrc')();

  return Promise.all(packages.filter(x => !x.isApp).map(pack => new Promise(
    (yay, nay) => gulp.src(pack.resolve('src', '**', '*.js'))
      .pipe(plumber({ errorHandler: err => gutil.log(err.stack) }))
      .pipe(through.obj((file, enc, callback) => {
        file._path = file.path;
        file.path = file.path.replace(pack.resolve('src'), pack.resolve('lib'));
        callback(null, file);
      }))
      .pipe(newer(pack.resolve('lib')))
      .pipe(through.obj((file, enc, callback) => {
        gutil.log(`Compiling '${chalk.cyan(file._path)}'...`);
        callback(null, file);
      }))
      .pipe(gulpBabel(babelConfig))
      .on('error', nay)
      .pipe(gulp.dest(pack.resolve('lib')))
      .on('end', yay)
    )
  )).catch(err => console.log(err));
}

const styles = packages => {
  return Promise.all(packages.filter(x => !x.isApp).map(pack => new Promise(
    (yay, nay) => gulp.src([pack.resolve('src', '**', '*.+(css|less|scss)')])
      .pipe(plumber({
        errorHandler(err) {
          gutil.log(err.stack);
        },
      }))
      .pipe(through.obj((file, enc, callback) => {
        file._path = file.path;
        file.path = file.path.replace(pack.resolve('src'), pack.resolve('lib'));
        callback(null, file);
      }))
      .pipe(newer(pack.resolve('lib')))
      .pipe(through.obj((file, enc, callback) => {
        gutil.log(`Copying '${chalk.cyan(file._path)}'...`);
        callback(null, file);
      }))
      .on('error', nay)
      .pipe(gulp.dest(pack.resolve('lib')))
      .on('end', yay)
    )
  )).catch(err => console.log(err));
}

module.exports = packages => ({
  build: () => {
    return Promise.all([babel(packages), styles(packages)]);
  },
  watch: () => {
    return gulpWatch(
      packages
        .filter(x => !x.isApp)
        .map(x => x.resolve('src', '**', '*.*')),
      { debounceDelay: 200 },
      () => Promise.all([babel(packages), styles(packages)])
    );
  }
});

/*// babel --watch src --out-dir lib --source-maps inline --copy-files
return packages
.map(pack => {
  return exec(command(path.resolve(packages.rootPath, 'node_modules', '.bin', 'babel'), pack.resolve('src'), pack.resolve('lib')), packages.rootPath);
});
const presets = 'babel-preset-react,babel-preset-react-optimize,babel-preset-latest,babel-preset-es2015,babel-preset-stage-0';
const plugins = 'transform-object-rest-spread,transform-es2015-destructuring,transform-class-properties,babel-plugin-add-module-exports,babel-plugin-transform-decorators-legacy';
const command = (babel, src, lib) => `${babel} --watch ${src} --out-dir ${lib} --presets ${presets} --plugins ${plugins} --source-maps inline --watch`;
*/
