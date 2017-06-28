'use strict';

/* Gulp plugins */
var gulp = require('gulp'), // Task runner
    notify = require('gulp-notify'),
    watch = require('gulp-watch'), // Watch, that actually is an endless stream
    rename = require('gulp-rename'), // Rename files
    del = require('del'), // Delete something
    path = require('path'),
    concat = require('gulp-concat'), // Concatenates files
    htmlmin = require('gulp-htmlmin'),
    less = require('gulp-less'), // Compile Less to CSS
    lessReporter = require('gulp-less-reporter'), // Error reporter for gulp-less
    autoprefixer = require('gulp-autoprefixer'), // Prefix CSS
    //csscomb = require('gulp-csscomb'), // Coding style formatter for CSS
    minifycss = require('gulp-minify-css'), // Minify CSS
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'), // Minify JS
    //jshint = require('gulp-jshint'), // JS code linter
    //stylish = require('jshint-stylish'), // Reporter for JSHint
    runSequence = require('run-sequence').use(gulp), // Run a series of dependent gulp tasks in order
    sourcemaps = require('gulp-sourcemaps'), // Write source maps
    browserSync = require('browser-sync'), // Synchronised browser testing
    reload = browserSync.reload,
    size = require('gulp-size'); // Display the size of something

/* Path settings */
var projectPath = {
    build: { // Set build paths
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/'
    },
    src: { // Set source paths
        html: 'src/index.html',
        js: 'src/js/app.js',
        style: 'src/styles/style.less'
    },
    watch: { // Set watch paths
        html: 'src/index.html',
        js: 'src/js/app.js',
        style: 'src/styles/style.less'
    },
    clean: ['build/**/*', '!build/.gitignore', '!build/favicon.ico'], // Set paths and exludes for cleaning build dir
};

/* BrowserSync local web server settings */
var config = {
    server: {
        baseDir: './build'
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    injectChanges: true,
    logPrefix: 'BrowserSync'
};

/*********/
/* Tasks */
/*********/

/* Default */
gulp.task('default', ['build'], function() {
    gulp.start('watch');
});

/* Build */
gulp.task('build', function(cb) {
    runSequence(
        'clean',
        'html',
        'js',
        'less',
        cb
    );
});

/* Clean build directory */
gulp.task('clean', function () {
    del(projectPath.clean);
});

/* HTML */
gulp.task('html', function () {
    return gulp.src(projectPath.src.html)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(size({
            title: 'HTML'
        }))
        .pipe(gulp.dest(projectPath.build.html))
        .pipe(reload({stream: true}));
});

/* JavaScript */
gulp.task('js', function () {
   return gulp.src(projectPath.src.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(size({
            title: 'JS'
        }))
        .pipe(gulp.dest(projectPath.build.js))
        .pipe(reload({stream: true}));
});


/* Less */
gulp.task('less', function() {
    return gulp.src(projectPath.src.style)
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .on('error', lessReporter)
        .pipe(autoprefixer('> 2%'))
        //.pipe(gulp.dest(projectPath.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(size({
            title: 'CSS'
        }))
        .pipe(gulp.dest(projectPath.build.css))
        .pipe(reload({stream: true}));
});

/* Watching */
gulp.task('watch', ['webserver'], function(){
    watch([projectPath.watch.html], function(event, cb) {
        notify("HTML Changed: " + event.path).write('');
        gulp.start('html');
    })
    watch([projectPath.watch.js], function(event, cb) {
        notify("JS Changed: " + event.path).write('');
        gulp.start('js');
    });
    watch([projectPath.watch.style], function(event, cb) {
        notify("LESS Changed: " + event.path).write('');
        gulp.start('less');
    });
});

/* BrowserSync local web server*/
gulp.task('webserver', function () {
    browserSync(config);
});
