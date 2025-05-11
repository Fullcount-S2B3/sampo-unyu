const gulp = require("gulp");
const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const fs = require("fs");
const browserSync = require("browser-sync").create();
const sassGlob = require("gulp-sass-glob");

const languages = ["ja", "en"];

// EJSビルド
function buildEJS(done) {
  Promise.all(
    languages.map((lang) => {
      const langData = JSON.parse(fs.readFileSync(`src/locales/${lang}.json`));
      const outputPath = lang === "ja" ? "docs" : `docs/${lang}`;

      return new Promise((resolve, reject) => {
        gulp
          .src("src/ejs/*.ejs")
          .pipe(ejs({ data: langData, lang }))
          .pipe(rename({ extname: ".html" }))
          .pipe(gulp.dest(outputPath))
          .on("end", () => {
            browserSync.stream();
            resolve();
          })
          .on("error", reject);
      });
    })
  )
    .then(() => done())
    .catch((err) => done(err));
}

// SCSSコンパイル
function compileSass() {
  return gulp
    .src("src/assets/scss/style.scss")
    .pipe(sassGlob())
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("docs/assets/css"))
    .pipe(browserSync.stream());
}

// サーバー立ち上げ + ファイル監視
function serve() {
  browserSync.init({
    server: "docs",
    port: 3000,
  });

  gulp.watch("src/ejs/**/*.ejs", buildEJS);
  gulp.watch("src/locales/*.json", buildEJS);
  gulp.watch("src/assets/**/*.scss", compileSass);
}

exports.build = gulp.series(buildEJS, compileSass);
exports.default = gulp.series(exports.build, serve);
exports.compileSass = compileSass;
exports.serve = gulp.series(compileSass, serve);
