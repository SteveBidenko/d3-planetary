var gulp = require('gulp'),
  mainBowerFiles = require('main-bower-files'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch'),
  minifyCss = require('gulp-minify-css');

gulp.task('default', ['sass', 'bower-files'], function () {
  console.log('Ran all the task');
});

/**
 * Compile scss files using by Sass-preprocessor
 **/
gulp.task('sass', function() {
  gulp.src('./sass/*.scss')
    .pipe(sass().on('error', sass.logError))
    /* .pipe(minifyCss()) */
    .pipe(gulp.dest('./site/css/'));
});

/**
 * start watching mode. In case changing any scss file it launch the compile process
 */
gulp.task('watch', function() {
    watch('./sass/*.scss', { interval: 1000 }, function(event, cb) {
        gulp.start('sass');
    });
});

/**
 * Add the d3 and planetary.js packages
 **/
gulp.task("bower-files", function () {
  gulp.src(mainBowerFiles({
    overrides: {
      d3: {
        main: "d3.js"
      },
      "planetary.js": {
        main: [
          "dist/planetaryjs.js",
          "dist/world-110m.json"
        ]
      }
    }
  })).pipe(gulp.dest("./site/lib"));
});
