const gulp = require('gulp');
const sass = require('gulp-dart-sass');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const pug = require('gulp-pug');
const del = require('del');
const browserSync = require("browser-sync");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config");

// 入出力するフォルダを指定
const srcBase = './src';
const distBase = './dist';
const wpBase = '../app/wp-content/themes/';


const srcPath = {
  'scss': srcBase + '/sass/pages/*.scss',
  'js': srcBase + '/js/pages/*.js',
  'pug': srcBase + '/pug/pages/**/*.pug',
  'img': srcBase + "/img/**/*.{jpg,jpeg,png,svg,gif,webp}",
  'video': srcBase + "/video/**/*.mp4",
  'public': srcBase + "/public/**"
};

const distPath = {
  'css': distBase + '/assets/css/',
  'js': distBase + '/assets/js/',
  'pug': distBase + '/',
  'img': distBase + "/assets/img",
  'video': distBase + "/assets/video",
  'public': distBase + "/"
};

const wpPath = {
  'css': wpBase + '/assets/css/',
  'js': wpBase + '/assets/js/',
  // 'pug': wpBase + '/',
  'img': wpBase + "/assets/img",
  'video': wpBase + "/assets/video",
  'public': wpBase + "/"
};


// SCSSコンパイルするタスク
const compileSass = () => {
  return gulp.src(srcPath.scss)
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(autoprefixer({ cascade: true }))
    .pipe(gulp.dest(distPath.css))
    // .pipe(gulp.dest(wpPath.css))
    .pipe(browserSync.stream())
}

// JSコンパイルするタスク
const compileJs = () => webpackStream(webpackConfig, webpack)
  .on("error", function (err) {
    console.log("==js compile error==============", err);
  })
  .pipe(gulp.dest(distPath.js))
  .pipe(gulp.dest(wpPath.js))

// Pugコンパイルするタスク
const compilePug = () => {
  return gulp.src(srcPath.pug)
    .pipe(pug({
      pretty: true,
      basedir: srcBase + "/pug"
    }))
    .pipe(gulp.dest(distPath.pug));
}

const compileImg = () => {
  return gulp.src(srcPath.img)
    .pipe(gulp.dest(distPath.img));
  // .pipe(gulp.dest(wpPath.img));
}

const compileVideo = () => {
  return gulp.src(srcPath.video)
    .pipe(gulp.dest(distPath.video))
  // .pipe(gulp.dest(wpPath.video));
}

const copyPublic = () => {
  return gulp.src(srcPath.public)
    .pipe(gulp.dest(distPath.public))
  // .pipe(gulp.dest(wpPath.public));
}



/**
 * ローカルサーバー立ち上げ
 */
const browserSyncFunc = () => {
  browserSync.init(browserSyncOption);
}

const browserSyncOption = {
  server: distBase,
  open: false
}

/**
 * リロード
 */
const browserSyncReload = (done) => {
  browserSync.reload();
  done();
}

// distを空にするタスク
const distClean = (done) => {
  del([distBase + "/**", `!${distBase}/.gitignore`]);
  done();
}
const wpDistClean = (done) => {
  del([wpPath.css, wpPath.js, wpPath.img, wpPath.video]);
  done();
}

const watchFiles = () => {
  gulp.watch(srcBase + "/**/*.scss", gulp.series(compileSass, browserSyncReload))
  gulp.watch(srcBase + "/**/*.{jpg,jpeg,png,svg,gif}", gulp.series(compileImg, browserSyncReload))
  gulp.watch(srcBase + "/**/*.mp4", gulp.series(compileVideo, browserSyncReload))
  gulp.watch(srcBase + "/**/*.js", gulp.series(compileJs, browserSyncReload))
  gulp.watch(srcBase + "/**/*.pug", gulp.series(compilePug, browserSyncReload))
}


/**
 * seriesは「順番」に実行
 * parallelは並列で実行
 */
exports.default = gulp.series(
  gulp.parallel(compileSass, compileJs, compilePug, compileImg, compileVideo, copyPublic),
  gulp.parallel(watchFiles, browserSyncFunc)
);

exports.wpdev = gulp.series(
  wpDistClean,
  gulp.parallel(compileSass, compileJs, compileImg, compileVideo, copyPublic),
  gulp.parallel(watchFiles)
);


exports.build = gulp.series(
  distClean,
  gulp.parallel(compileSass, compileJs, compilePug, compileImg)
);

exports.clean = gulp.series(distClean)