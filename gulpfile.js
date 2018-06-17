var gulp = require('gulp');


var cssnano = require('gulp-cssnano')    // 合并文件
var htmlmin = require('gulp-htmlmin')    // html压缩
var concat = require('gulp-concat')      // CSS压缩
var uglify = require('gulp-uglify')      // js压缩
var clean = require('gulp-clean')        //清空文件夹


gulp.task('html', function () {
  return gulp.src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'))
})

gulp.task('css', function () {
  gulp.src('./src/css/*.css')
      .pipe(concat('index-merge.css'))
      .pipe(cssnano())
      .pipe(gulp.dest('dist/css'))
});

gulp.task('js', function (argument) {
  return gulp.src('src/js/*.js')
    .pipe(concat('merge.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js/'));
});

gulp.task('clear', function () {
  gulp.src('dist/*', { read: false })
    .pipe(clean());
});

gulp.task('build', ['html','css', 'js']);