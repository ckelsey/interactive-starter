var gulp = require('gulp'),
    compass = require('gulp-compass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglifyjs'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    plumber = require('gulp-plumber'),
    path = require('path'),
    ngAnnotate = require('gulp-ng-annotate'),
    minifyHtml = require('gulp-minify-html'),
    embedTemplates = require('gulp-angular-embed-templates'),
    ngHtml2Js = require('gulp-ng-html2js'),
	browserSync = require('browser-sync').create(),
	zip = require('gulp-zip');

var notifyInfo = {
    title: 'Gulp',
    icon: path.join(__dirname, 'gulp.png')
};

var plumberErrorHandler = {
    errorHandler: notify.onError({
        title: notifyInfo.title,
        icon: notifyInfo.icon,
        message: "Error: <%= error.message %>"
    })
};


var stylesToDo = [
    'src/style/*.scss',
];

gulp.task('styles', function() {
    return gulp.src(stylesToDo)
        .pipe(plumber(plumberErrorHandler))
        .pipe(gulp.dest('dist/css/build/sass'))
        .pipe(compass({
            css: 'dist/css/build/css',
            sass: 'dist/css/build/sass',
            image: 'app/css/images'
        }))
        .pipe(autoprefixer('last 2 version', 'Safari', 'ie', 'opera', 'ios', 'android', 'chrome', 'firefox'))
        .pipe(concat('starter.css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));
});


var vendor_scripts = [
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/mfly-commands/src/mflyCommands.js',
    'bower_components/angular/angular.min.js',
    'bower_components/angular-resource/angular-resource.js',
    'bower_components/angular-sanitize/angular-sanitize.js',
    'bower_components/angular-route/angular-route.js',
    'bower_components/angular-loader/angular-loader.js',
    'bower_components/angular-animate/angular-animate.min.js',
    'bower_components/ngstorage/ngstorage.min.js',
	'bower_components/snap.svg/dist/snap.svg-min.js'
];

gulp.task('vendor_scripts', function() {
    return gulp.src(vendor_scripts)
        .pipe(plumber(plumberErrorHandler))
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('dist/js'))
});


var app_scripts = [
    'src/**/**.js'
];

gulp.task('app_scripts', function() {
    return gulp.src(app_scripts)
        .pipe(plumber(plumberErrorHandler))
        .pipe(ngAnnotate({
            // true helps add where @ngInject is not used. It infers.
            // Doesn't work with resolve, so we must be explicit there
            add: true
        }))
        .pipe(embedTemplates())
        .pipe(uglify('starter.min.js', {
            outSourceMap: true
        }))
        .pipe(gulp.dest('dist/js'))
});

var htmlToDo = [
    '*.html',
    'src/html/*.html'
];


var buildFiles = [
	'bower_components/fontawesome/css/font-awesome.min.css',
	'bower_components/fontawesome/css/font-awesome.css.map',
	'bower_components/fontawesome/fonts/*.*',
	'bower_components/wheel_menu/dist/js/wheel_menu.min.js',
	'bower_components/wheel_menu/dist/js/wheel_menu.min.js.map',
	'bower_components/wheel_menu/dist/css/fonts/*.*',
	'bower_components/wheel_menu/dist/css/wheel_menu.min.css',
	// 'bower_components/*/*/*.*',
	'dist/**',
	'interactive-manifest.json',
	'favicon.ico',
	'index.html'
];

gulp.task('build', function() {
	return gulp.src(buildFiles, {base: './'}).pipe(gulp.dest('build'));
});


gulp.task('zip', function() {
	return gulp.src([
		'./build/**'
	])
	.pipe(zip('interactive-starter.interactive'))
	.pipe(gulp.dest(''));
});


var viewerMiddleware = require('mfly-interactive')({
	url: 'https://viewer.mediafly.com/chrisk1123/interactive/fd49c200129340049f24252183741258product285695/index.html'
});

gulp.task('browser-sync', function() {
	browserSync.init({
		files: 'build/**',
		https: true,
		server: {
			baseDir: "./build/",
			middleware: [
				viewerMiddleware
			]
		}
	});
});




gulp.task('live', function() {
    livereload.listen();
    gulp.watch(stylesToDo, ['styles', 'build']);
    gulp.watch(vendor_scripts, ['vendor_scripts', 'build']);
    gulp.watch(app_scripts, ['app_scripts', 'build']);
    gulp.watch(htmlToDo, ['app_scripts', 'build']);
});

gulp.task('default', [
    'styles',
    'vendor_scripts',
    'app_scripts',
    'live',
	'zip',
	'browser-sync'
], function() {});
