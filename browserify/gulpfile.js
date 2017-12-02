/* jshint ignore:start */
'use strict';

/* Gulp plugins */
const gulp = require('gulp'), // Task runner
    babel = require('gulp-babel');


/* JavaScript */
gulp.task('js', function() {
    return gulp.src(['a.js','script.js'])
        .pipe(babel({presets: ['es2015']}))
        .pipe(gulp.dest('z.js'))
});
