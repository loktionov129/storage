/* jshint ignore:start */
'use strict';
/* jshint ignore:end */
/* jshint esversion:6 */
/* jshint unused:true */

/* Gulp plugins */
import gulp from 'gulp4';						// Task runner
import gutil from 'gulp-util';					// Utility functions for gulp plugins
import plumber from 'gulp-plumber';				// Prevent pipe breaking caused by errors from gulp plugins
import notify from 'gulp-notify';				// Notification plugin for gulp
import del from 'del';							// Delete something
import rename from 'gulp-rename';				// Rename files
import concat from 'gulp-concat';				// Concatenates files
import htmlmin from 'gulp-htmlmin';				// Minify HTML
import less from 'gulp-less';					// Compile less to CSS
import autoprefixer from 'gulp-autoprefixer';	// Prefix CSS
import cleanCSS from 'gulp-clean-css';			// Minify CSS
import gcmq from 'gulp-group-css-media-queries';
import babel from 'gulp-babel';					// Compile ES6 to ES5
import uglify from 'gulp-uglify';				// Minify JS
import jshint from 'gulp-jshint';				// JS code linter
import stylish from 'jshint-stylish';			// Reporter for JSHint
import sourcemaps from 'gulp-sourcemaps';		// Write source maps
import browserSync from 'browser-sync';			// Synchronised browser testing
import size from 'gulp-size';					// Display the size of something
const reload = browserSync.reload;

/* Project settings */
const config = {
	// gulp <taskname> --production
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

const clean = () => del(config.path.clean);
export { clean };

export function html() {
	return gulp.src(config.path.src.html)
		.pipe(plumber({
			errorHandler: function(error) {
				const message = error.message || '';
				const errName = error.name || '';

				gutil.log(gutil.colors.red.bold('[HTML Error]') + ' ' + gutil.colors.bgRed(errName));
				gutil.log(gutil.colors.bold('message:') + ' ' + message);
				notify({
					title: "[HTML Error] " + errName,
					message: message
				}).write('');
				this.emit('end');
			}
		}))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(size({ title: 'HTML' }))
		.pipe(gulp.dest(config.path.build.html))
		.pipe(reload({ stream: true }));
}

export function css() {
	return gulp.src(config.path.src.style)
		.pipe(plumber({
			errorHandler: function(error) {
				const type = error.type || '';
				const message = error.message || '';
				const extract = error.extract || [];
				const line = error.line || '';
				const column = error.column || '';
				gutil.log(gutil.colors.red.bold('[LESS Error]') + ' ' + gutil.colors.bgRed(type + ' (' + line + ':' + column + ')'));
				gutil.log(gutil.colors.bold('message:') + ' ' + message);
				gutil.log(gutil.colors.bold('codeframe:') + '\n' + extract.join('\n'));
				notify({
					title: "[LESS Error] " + type + ' (' + line + ':' + column + ')',
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
		.pipe(size({ title: 'CSS' }))
		.pipe(gulp.dest(config.path.build.css))
		.pipe(reload({ stream: true }));
}

export function js() {
	return gulp.src(config.path.src.js)
		.pipe(plumber({
			errorHandler: function(error) {
				const message = error.message || '';
				const errName = error.name || '';
				const codeFrame = error.codeFrame || '';
				gutil.log(gutil.colors.red.bold('[JS Error]') + ' ' + gutil.colors.bgRed(errName));
				gutil.log(gutil.colors.bold('message:') + ' ' + message);
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
		.pipe(babel({ presets: ['es2015'] }))
		.pipe(concat('app.js'))
		//.pipe(gulp.dest(config.path.build.js))
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(config.production ? gutil.noop() : sourcemaps.write('./'))
		.pipe(size({ title: 'JS' }))
		.pipe(gulp.dest(config.path.build.js))
		.pipe(reload({ stream: true }));
}

export function webserver() {
	return browserSync({
		server: {
			baseDir: './build'
		},
		tunnel: true,
		host: 'localhost',
		port: 9000,
		injectChanges: true,
		logPrefix: 'BrowserSync'
	});
}

const watch = gulp.parallel(
	webserver,
	() => {
		gulp.watch(config.path.watch.html, html);
		gulp.watch(config.path.watch.css, css);
		gulp.watch(config.path.watch.js, js);
	}
);
export { watch };

const build = gulp.series(clean, gulp.parallel(html, css, js));
export { build };

export default build;
