var gulp = require('gulp');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var reactify = require('gulp-reactify');
var uglify = require('gulp-uglify');

// Компиляция jsx, объединение и минификация файлов aprth/js
gulp.task('reactify_dev',function(){
	gulp.src(['src/aprth/js/core/config_dev.js','src/aprth/js/core/utils.js','src/aprth/js/core/client.js',
		'src/aprth/js/resources/*.js','src/aprth/js/objects/*.js',
		'src/aprth/js/components/*.js','src/aprth/js/units/*.js','src/aprth/js/app.js'])
	.pipe(reactify())
	.pipe(concat('main.js'))
	.pipe(uglify())
	.pipe(gulp.dest('public/aprth/js'));

});

// Компиляция jsx, объединение и минификация файлов aprth/js
gulp.task('reactify_prod',function(){
	gulp.src(['src/aprth/js/core/config_prod.js','src/aprth/js/core/utils.js','src/aprth/js/core/client.js',
		'src/aprth/js/resources/*.js','src/aprth/js/objects/*.js',
		'src/aprth/js/components/*.js','src/aprth/js/units/*.js','src/aprth/js/app.js'])
	.pipe(reactify())
	.pipe(concat('main.js'))
	.pipe(uglify())
	.pipe(gulp.dest('public/aprth/js'));

});

// Минификация css
gulp.task('mincss',function(){
	gulp.src('src/aprth/css/damteam.webflow.css')
	.pipe(cssnano())
	.pipe(gulp.dest('public/aprth/css'));
	gulp.src(['src/css/nanoscroller.css','src/css/webflow.css'])
	.pipe(cssnano())
	.pipe(gulp.dest('public/css'));
});

// Копирование остальных файлов
gulp.task('copy',function(){
	gulp.src(['src/js/*.js',
			'src/js/bootstrap-datepicker-locales/bootstrap-datepicker.ru.min.js',
			])
	.pipe(gulp.dest('public/js'));

	gulp.src(['src/css/bootstrap.min.css','src/css/bootstrap-datepicker.min.css'])
	.pipe(gulp.dest('public/css'));

	gulp.src('src/aprth/css/common.css')
	.pipe(gulp.dest('public/aprth/css'));

	gulp.src('src/aprth/img/*.*')
	.pipe(gulp.dest('public/aprth/img'));
	
	gulp.src('src/fonts/*.*')
	.pipe(gulp.dest('public/fonts'));
	
	gulp.src('src/index.html')
	.pipe(gulp.dest('public'));
});

// Задача по умолчанию, включает последовательное выполнение остальных задач
gulp.task('default',['reactify_dev','mincss','copy']);

gulp.task('prod',['reactify_prod','mincss','copy']);
// Задача просмотра изменений в папке src
gulp.task('watch', function() {
	gulp.watch('src/**/*.*',['default']);
})
