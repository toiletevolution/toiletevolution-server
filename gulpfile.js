'use strict';

// Include Gulp & tools we'll use
const gulp = require('gulp');
const gae = require('gulp-gae');

const del = require('del');
const browserSync = require('browser-sync');
const path = require('path');
const tcpp = require('tcp-ping');
const loop = require('loop')();
const remoteSrc = require('gulp-remote-src');
const replace = require('gulp-replace');
const waitOn = require('wait-on');
const insert = require('gulp-insert');
const http = require('http');
const decode = require('decode-html');
const composer = require('gulp-composer');
const aglio = require('gulp-aglio');
const {PolymerProject, getOptimizeStreams, HtmlSplitter} = require('polymer-build');
const mergeStream = require('merge-stream');
const gulpif = require('gulp-if');
 
const project = new PolymerProject(require('./polymer.json'));
const htmlSplitter = new HtmlSplitter();

const DIST = '.tmp';

const dist = function(subpath) {
  return !subpath ? DIST : path.join(DIST, subpath);
};

gulp.task('composer', function() {
  return composer();
});

// Install dependencies
gulp.task('install', gulp.series('composer'));

// Clean output directory
gulp.task('clean', function() {
  return del([dist()]);
});

gulp.task('polymer-build', function() {
  return mergeStream(project.sources(), project.dependencies())
//    .pipe(project.addCustomElementsEs5Adapter())
    .pipe(project.bundler())
//    .pipe(htmlSplitter.split())
//    .pipe(gulpif(/\.js$/, getOptimizeStreams({
//      js: {
//        compile: true,
//        moduleResolution: project.config.moduleResolution,
//      },
//      entrypointPath: project.config.entrypoint,
//      rootDir: project.config.root,
//    })[0]))
//    .pipe(htmlSplitter.rejoin())
    .pipe(gulp.dest(dist()));
});

gulp.task('remote-src', function() {
  return remoteSrc(['loader.js'], {base: 'https://www.gstatic.com/charts/'})
    .pipe(gulp.dest('.tmp/public/bower_components/google-chart'));
});

gulp.task('hotfix-build', gulp.series('remote-src', function(done) {
  require('fs').writeFileSync('.tmp/public/bower_components/google-chart/charts-loader.js', '<script src="loader.js"></script>');
  done();
}));

gulp.task('with-api-key', function() {
  return gulp
        .src(['.tmp/public/elements/te-admin.js', '.tmp/public/elements/te-devices.js'], {base: '.'})
        .pipe(replace('api-key=""', 'api-key="'+process.env.APIKEY+'"'))
        .pipe(gulp.dest('.'));
});

gulp.task('build', gulp.series('clean', 'polymer-build', 'with-api-key', function(done) {
  done();
}));

gulp.task('deploy', gulp.series('build', function () {
  gulp.src(dist('app.yaml'))
    .pipe(gae('appcfg.py', ['update'], {
      version: 'v1',
      oauth2: undefined // for value-less parameters
    }));
}));

gulp.task('gae-serve', function () {
  gulp
    .src(dist('app.yml'))
    .pipe(gae('dev_appserver.py', [], {
      port: 8888,
      host: '0.0.0.0',
      admin_port: 8001,
      admin_host: '0.0.0.0'
    }));

  gulp.watch(['app.yml', 'public/**/*.html', 'public/**/*.js', 'public/styles/**/*.css', 'public/elements/**/*.css', 'public/images/**/*'], gulp.task('build'));
});

// Watch files for changes & reload
gulp.task('serve', gulp.series('gae-serve', function() {


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


}));

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

gulp.task('test', gulp.series('copy-php.ini', function(done) {
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
        console.log(decode(chunk.toString()));
      });
      res.on('end', function() {
        done();
      });
    });
  });
}));

gulp.task('docs', function () {
  gulp.src('docs/*.md')
    .pipe(aglio({ template: 'default' }))
    .pipe(gulp.dest('./public/docs'));
});

// Build production files, the default task
gulp.task('default', gulp.series('clean', 'build', 'serve', function(done) {
  done();
}));

// Load tasks for web-component-tester
// Adds tasks for `gulp test:local` and `gulp test:remote`
//require('web-component-tester').gulp.init(gulp);
