/* jshint ignore:start */
'use strict';

/* Gulp plugins */
const gulp = require('gulp'), // Task runner
    gutil = require('gulp-util'), // Utility functions for gulp plugins
    plumber = require('gulp-plumber'), // Prevent pipe breaking caused by errors from gulp plugins
    notify = require('gulp-notify'), // Notification plugin for gulp
    watch = require('gulp-watch'), // Watch, that actually is an endless stream
    del = require('del'), // Delete something
    rename = require('gulp-rename'), // Rename files
    concat = require('gulp-concat'), // Concatenates files
    htmlmin = require('gulp-htmlmin'),
    less = require('gulp-less'), // Compile less to CSS
    autoprefixer = require('gulp-autoprefixer'), // Prefix CSS
    cleanCSS = require('gulp-clean-css'), // Minify CSS
    gcmq = require('gulp-group-css-media-queries'),
    babel = require('gulp-babel'),
    uglify = require('gulp-uglify'), // Minify JS
    jshint = require('gulp-jshint'), // JS code linter
    stylish = require('jshint-stylish'), // Reporter for JSHint
    runSequence = require('run-sequence').use(gulp), // Run a series of dependent gulp tasks in order
    sourcemaps = require('gulp-sourcemaps'), // Write source maps
    browserSync = require('browser-sync'), // Synchronised browser testing
    reload = browserSync.reload,
    size = require('gulp-size'); // Display the size of something

/* Project settings */
const config = {
    production: !!gutil.env.production,
    path: {
        build: { // Set build paths
            html: 'build/',
            js: 'build/js/',
            css: 'build/css/'
        },
        src: { // Set source paths
            html: 'src/index.html',
            js: 'src/js/**/*.js',
            style: 'src/styles/main.less'
        },
        watch: { // Set watch paths
            html: 'src/index.html',
            js: 'src/js/**/*.js',
            style: 'src/styles/**/*.less'
        },
        clean: ['build/**/*', '!build/.gitignore', '!build/favicon.ico'], // Set paths and exludes for cleaning build dir
    }
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
        'css',
        cb
    );
});

/* Clean build directory */
gulp.task('clean', function () {
    del(config.path.clean);
});

/* HTML */
gulp.task('html', function () {
    return gulp.src(config.path.src.html)
        .pipe(plumber({
            errorHandler: function (error) {
                const message = error.message || '';
                const errName = error.name || '';

                gutil.log(gutil.colors.red.bold('[HTML Error]')+' '+ gutil.colors.bgRed(errName));
                gutil.log(gutil.colors.bold('message:') +' '+ message);
                notify({
                    title: "[HTML Error] " + errName,
                    message: message
                }).write('');
                this.emit('end');
            }
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(size({title: 'HTML'}))
        .pipe(gulp.dest(config.path.build.html))
        .pipe(reload({stream: true}));
});

/* JavaScript */
gulp.task('js', function() {
    return gulp.src(config.path.src.js)
        .pipe(plumber({
            errorHandler: function (error) {
                const message = error.message || '';
                const errName = error.name || '';
                const codeFrame = error.codeFrame || '';
                gutil.log(gutil.colors.red.bold('[JS Error]')+' '+ gutil.colors.bgRed(errName));
                gutil.log(gutil.colors.bold('message:') +' '+ message);
                gutil.log(gutil.colors.bold('codeframe:') + '\n' + codeFrame);
                notify({
                    title: "[JS Error] " + errName,
                    message: message
                }).write('');
                this.emit('end');
            }
        }))
        .pipe(config.production ? gutil.noop() : sourcemaps.init())
        .pipe(jshint()).pipe(jshint.reporter(stylish))
        .pipe(babel({presets: ['es2015']}))
        .pipe(concat('app.js'))
        //.pipe(gulp.dest(config.path.build.js))
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(config.production ? gutil.noop() : sourcemaps.write('./'))
        .pipe(size({title: 'JS'}))
        .pipe(gulp.dest(config.path.build.js))
        .pipe(reload({stream: true}));
});


/* CSS */
gulp.task('css', function() {
    return gulp.src(config.path.src.style)
        .pipe(plumber({
            errorHandler: function (error) {
                const type = error.type || '';
                const message = error.message || '';
                const extract = error.extract || [];
                const line = error.line || '';
                const column = error.column || '';
                gutil.log(gutil.colors.red.bold('[LESS Error]') +' '+ gutil.colors.bgRed(type +' ('+ line +':'+ column +')'));
                gutil.log(gutil.colors.bold('message:') +' '+ message);
                gutil.log(gutil.colors.bold('codeframe:') +'\n'+ extract.join('\n'));
                notify({
                    title: "[LESS Error] " + type +' ('+ line +':'+ column +')',
                    message: message + extract.join('\n')
                }).write('');
                this.emit('end');
            }
        }))
        .pipe(config.production ? gutil.noop() : sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer('> 2%'))
        .pipe(gcmq())
        .pipe(concat('style.css'))
        //.pipe(gulp.dest(config.path.build.css))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS())
        .pipe(config.production ? gutil.noop() : sourcemaps.write('./'))
        .pipe(size({title: 'CSS'}))
        .pipe(gulp.dest(config.path.build.css))
        .pipe(reload({stream: true}));
});

/* Watching */
gulp.task('watch', ['webserver'], function(){
    watch([config.path.watch.html], function(event, cb) {
        gulp.start('html');
    })
    watch([config.path.watch.js], function(event, cb) {
        gulp.start('js');
    });
    watch([config.path.watch.style], function(event, cb) {
        gulp.start('css');
    });
});

/* BrowserSync local web server*/
gulp.task('webserver', function () {
    browserSync({
        server: {
            baseDir: './build'
        },
        tunnel: true,
        host: 'localhost',
        port: 9000,
        injectChanges: true,
        logPrefix: 'BrowserSync'
    });
});

/*

[BrowserSync] Localtunnel issue: connection refused: localtunnel.me:40611 (check your firewall settings)
[BrowserSync] Oops! The localtunnel appears to have disconnected. Reconnecting...


*/
