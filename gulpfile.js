'use strict';

// Include Gulp & tools we'll use
var gulp = require('gulp');
var gae = require('gulp-gae');

var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var path = require('path');
var exec = require('child_process').exec;
var tcpp = require('tcp-ping');
var loop = require('loop')();
var remoteSrc = require('gulp-remote-src');
var replace = require('gulp-replace');
var waitOn = require('wait-on');
var insert = require('gulp-insert');
var http = require('http');
var exit = require('gulp-exit');

var AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var DIST = 'build';

var dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

// Clean output directory
gulp.task('clean', function() {
  return del(['.tmp', dist()]);
});

// Build polymer app
gulp.task('build', ['copy-tmp'], function (cb) {
  process.chdir('.tmp');
  exec('polymer build', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
    reload();
  });
});

gulp.task('deploy', ['build'], function () {
  gulp.src('.tmp/build/bundled/app.yaml')
    .pipe(gae('appcfg.py', ['update'], {
      version: 'v1',
      oauth2: undefined // for value-less parameters
    }));
});

gulp.task('copy-tmp', function(cb) {
  runSequence('copy-public', 'copy-src', 'copy-vendor', 'copy-etc', 'hotfix-build', 'with-api-key', cb);
});

gulp.task('copy-public', function() {
  return gulp
    .src(['./public/**/*'], {base: '.'})
    .pipe(gulp.dest('.tmp'));
});

gulp.task('copy-src', function() {
  return gulp
    .src(['./src/**/*'], {base: '.'})
    .pipe(gulp.dest('.tmp'));
});

gulp.task('copy-vendor', function() {
  return gulp
    .src(['./vendor/**/*'], {base: '.'})
    .pipe(gulp.dest('.tmp'));
});

gulp.task('copy-etc', function() {
  return gulp
    .src(['app.yml', 'php.ini', 'polymer.json'])
    .pipe(gulp.dest('.tmp'));
});

gulp.task('hotfix-build', function() {
  remoteSrc(['loader.js'], {base: 'https://www.gstatic.com/charts/'})
    .pipe(gulp.dest('.tmp/public/bower_components/google-chart'));
  require('fs').writeFileSync('.tmp/public/bower_components/google-chart/charts-loader.html', '<script src="loader.js"></script>');
});

gulp.task('with-api-key', function() {
  return gulp
        .src(['.tmp/public/elements/te-form.html', '.tmp/public/elements/te-device-detail.html'], {base: '.'})
        .pipe(replace('api-key=""', 'api-key="'+process.env.APIKEY+'"'))
        .pipe(gulp.dest('.'));
});

// Watch files for changes & reload
gulp.task('serve', ['gae-serve'], function() {


  loop.run(function (next) {
    tcpp.probe('127.0.0.1', 8888, function(err, available) {

      if(available) {

        browserSync({
          browser: "google chrome",
          port: 7000,
          proxy: 'http://localhost:8888',
          notify: false,
          logPrefix: 'PSK',
          snippetOptions: {
            rule: {
              match: '<span id="browser-sync-binding"></span>',
              fn: function(snippet) {
                return snippet;
              }
            }
          }
          // Run as an https by uncommenting 'https: true'
          // Note: this uses an unsigned certificate which on first access
          //       will present a certificate warning in the browser.
          // https: true,
        });

        next("break");

      } else {

        next(undefined);

      }
    });
  }, 0);


});

gulp.task('gae-serve', function () {
  gulp
    .src('build/bundled/app.yml')
    .pipe(gae('dev_appserver.py', [], {
      port: 8888,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));

  gulp.watch(['app.yml', 'public/**/*.html', 'public/styles/**/*.css', 'public/elements/**/*.css', 'public/images/**/*'], ['build']);
});

gulp.task('debug', function (done) {
  gulp
    .src('app.yml')
    .pipe(gae('dev_appserver.py', [], {
      port: 8888,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));
  waitOn({
    resources: ['http://localhost:8888']
  }, function() {
    done();
  });
});

gulp.task('copy-php.ini', function() {
  return gulp.src('php.ini')
    .pipe(insert.append('google_app_engine.disable_readonly_filesystem = 1'))
    .pipe(gulp.dest('./tests'));
});

gulp.task('test', ['copy-php.ini'], function(done) {
  gulp
    .src('tests/app.yml')
    .pipe(gae('dev_appserver.py', ['--dev_appserver_log_level=error'], {
      port: 8888,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));
  waitOn({
    resources: ['http://localhost:8888']
  }, function() {
    http.get({
      hostname: 'localhost',
      port: 8888,
      path: '/phpunit'
    }, function(res) {
      res.on("data", function(chunk) {
        console.log(chunk.toString());
      });
      res.on('end', function() {
        done();
      });
    });
  });
});

// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  // Uncomment 'cache-config' if you are going to use service workers.
  runSequence(
    'build',
    'serve',
    cb);
});

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
//require('web-component-tester').gulp.init(gulp);

// Load custom tasks from the `tasks` directory
try {
  require('require-dir')('tasks');
} catch (err) {}
