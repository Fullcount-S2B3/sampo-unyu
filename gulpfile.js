const gulp = require('gulp')
const gulpEjs = require('gulp-ejs') // gulp-ejs プラグイン用
const ejsEngine = require('ejs')    // EJS API (render関数) 用
const rename = require('gulp-rename')
const sass = require('gulp-sass')(require('sass'))
const fs = require('fs')
const path = require('path') // pathモジュール
const browserSync = require('browser-sync').create()
const sassGlob = require('gulp-sass-glob')
const sourcemaps = require('gulp-sourcemaps')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssDeclarationSorter = require('css-declaration-sorter')
const webpack = require('webpack')
const webpackStream = require('webpack-stream')
const plumber = require('gulp-plumber')
const imagemin = require('gulp-imagemin')
const imageminWebp = require('imagemin-webp').default
const data = require('gulp-data')
const { stripHtml } = require('string-strip-html')
const changed = require('gulp-changed').default

const languages = ['ja', 'en']

// JSONファイルを安全に読み込むヘルパー関数
function readJsonFile(filePath, lang, fileNameForLog = filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const rawData = fs.readFileSync(filePath)
      return JSON.parse(rawData)
    } else {
      return {}
    }
  } catch (e) {
    console.error(
      `[JSON Read][${lang}] Error parsing ${fileNameForLog}: ${e.message}`,
    )
    return {}
  }
}

/**
 * 多言語対応のEJSテンプレートをHTMLに変換する
 */
function buildEJS(done) {
  const SITE_BASE_URL = 'https://sampo-unyu.co.jp'; 

  const allProcessingPromises = languages.flatMap((lang) => {
    const commonData = readJsonFile(`src/locales/${lang}/common.json`, lang)
    const newsArticlesData = readJsonFile(
      `src/locales/${lang}/news-articles.json`,
      lang,
    )
    const pageFiles = {
      home: 'home.json',
      news: 'news-list.json',
      domestic: 'domestic.json',
      international: 'international.json',
      about: 'about.json',
      fleet: 'fleet.json',
    }
    const pagesData = {}
    for (const pageId in pageFiles) {
      pagesData[pageId] = readJsonFile(
        `src/locales/${lang}/${pageFiles[pageId]}`,
        lang,
      )
    }

    if (newsArticlesData.articles && Array.isArray(newsArticlesData.articles)) {
      newsArticlesData.articles.forEach((article) => {
        if (article.content_html) {
          article.plain_text_content = stripHtml(article.content_html).result
        } else {
          article.plain_text_content = ''
        }
      })
    }

    // 1. 固定ページの処理
    const fixedPagesPromise = new Promise((resolve, reject) => {
      gulp
        .src([
          'src/ejs/**/*.ejs',
          '!src/ejs/**/_*.ejs',
          '!src/ejs/_templates/**/*.ejs',
        ])
        .pipe(
          plumber({
            errorHandler: function (err) {
              const fileName =
                err.fileName || (err.cause && err.cause.path) || 'EJS file'
              console.error(
                `[EJS PLUMBER:${lang}] Error in ${fileName}: ${err.message}`,
              )
              this.emit('end')
              reject({
                lang: lang,
                type: 'ejs_plumber_error_fixed',
                file: fileName,
                message: err.message,
              })
            },
          }),
        )
        .pipe(
          data(function (file) {
            const sourceFileRelativeDir = path.dirname(
              path.relative(path.join(file.cwd, 'src/ejs'), file.path),
            )
            let outputDirForCurrentFile =
              lang === 'ja'
                ? path.join('docs', sourceFileRelativeDir)
                : path.join('docs', lang, sourceFileRelativeDir)

            let assetPath = path
              .relative(outputDirForCurrentFile, 'docs/assets')
              .replace(/\\/g, '/')
            if (assetPath && !assetPath.endsWith('/')) assetPath += '/'
            else if (assetPath === '') assetPath = './'
            if (assetPath === 'assets/') assetPath = './assets/'

            const langRootDir = lang === 'ja' ? 'docs' : `docs/${lang}`
            let pageLinkBasePath = path
              .relative(outputDirForCurrentFile, langRootDir)
              .replace(/\\/g, '/')
            if (pageLinkBasePath === '') pageLinkBasePath = './'
            else if (!pageLinkBasePath.endsWith('/')) pageLinkBasePath += '/'

            const otherLang = lang === 'ja' ? 'en' : 'ja'
            const otherLangRootDirPath =
              otherLang === 'ja' ? 'docs' : `docs/${otherLang}`
            let pageLinkToOtherLangRoot = path
              .relative(outputDirForCurrentFile, otherLangRootDirPath)
              .replace(/\\/g, '/')
            if (pageLinkToOtherLangRoot === '') pageLinkToOtherLangRoot = './'
            else if (!pageLinkToOtherLangRoot.endsWith('/'))
              pageLinkToOtherLangRoot += '/'

            const relativePathFromEjsRoot = path.relative(
              path.join(file.cwd, 'src/ejs'),
              file.path,
            )
            let pageSpecificPath = path
              .dirname(relativePathFromEjsRoot)
              .replace(/\\/g, '/')
            if (pageSpecificPath === '.') pageSpecificPath = ''
            if (pageSpecificPath && !pageSpecificPath.endsWith('/'))
              pageSpecificPath += '/'
            const baseFileName = path.basename(relativePathFromEjsRoot, '.ejs')
            if (baseFileName !== 'index') {
              pageSpecificPath += baseFileName + '/'
            }

            const otherLangUrl = pageLinkToOtherLangRoot + pageSpecificPath

            let pageUrlPath = lang === 'ja' ? '/' : `/${lang}/`;
            if (pageSpecificPath) {
              pageUrlPath += pageSpecificPath;
            }
            if (pageUrlPath.endsWith('//') && pageUrlPath !== '//') pageUrlPath = pageUrlPath.slice(0, -1);
            const ogUrl = SITE_BASE_URL + pageUrlPath;

            let pageId = path.basename(file.path, '.ejs')
            if (pageId === 'index') {
              pageId =
                sourceFileRelativeDir === '.'
                  ? 'home'
                  : sourceFileRelativeDir.split(path.sep).pop()
            }

            return {
              data: {
                common: commonData,
                news_data: newsArticlesData,
                pages: pagesData,
              },
              lang: lang,
              assetPath: assetPath,
              pageLinkBasePath: pageLinkBasePath,
              pageLinkToOtherLangRoot: pageLinkToOtherLangRoot,
              otherLangUrl: otherLangUrl,
              ogUrl: ogUrl,
              pageId: pageId,
              currentPageData: pagesData[pageId] || {},
            }
          }),
        )
        .pipe(
          gulpEjs({}, {}, { ext: '.html' }).on('error', function (err) {
            const fileName = err.file || this.srcPath || 'EJS file'
            console.error(
              `[EJS RENDER FIXED:${lang}] Error in ${fileName}: ${err.message}`,
            )
            if (err.codeFrame) console.error(err.codeFrame)
          }),
        )
        .pipe(
          rename(function (p) {
            if (lang !== 'ja') {
              if (p.dirname === '.' || p.dirname === '') {
                p.dirname = lang
              } else {
                p.dirname = path.join(lang, p.dirname).replace(/\\/g, '/')
              }
            }
            p.extname = '.html'
          }),
        )
        .pipe(gulp.dest('docs'))
        .on('end', resolve)
        .on('error', reject)
    })

    // 2. ニュース詳細ページの動的生成
    const newsDetailPromises = []
    if (newsArticlesData.articles && Array.isArray(newsArticlesData.articles)) {
      newsArticlesData.articles.forEach((article) => {
        const articlePageId = `news-detail-${article.id}`
        const detailPageOutputDir =
          lang === 'ja'
            ? path.join('docs', 'news', article.id)
            : path.join('docs', lang, 'news', article.id)

        let detailAssetPath = path
          .relative(detailPageOutputDir, 'docs/assets')
          .replace(/\\/g, '/')
        if (detailAssetPath && !detailAssetPath.endsWith('/'))
          detailAssetPath += '/'
        else if (detailAssetPath === '') detailAssetPath = './'
        if (detailAssetPath === 'assets/') detailAssetPath = './assets/'

        const detailLangRootDir = lang === 'ja' ? 'docs' : `docs/${lang}`
        let detailPageLinkBasePath = path
          .relative(detailPageOutputDir, detailLangRootDir)
          .replace(/\\/g, '/')
        if (detailPageLinkBasePath === '') detailPageLinkBasePath = './'
        else if (!detailPageLinkBasePath.endsWith('/'))
          detailPageLinkBasePath += '/'

        const otherLang = lang === 'ja' ? 'en' : 'ja'
        const detailOtherLangRootDirPath =
          otherLang === 'ja' ? 'docs' : `docs/${otherLang}`
        let detailPageLinkToOtherLangRoot = path
          .relative(detailPageOutputDir, detailOtherLangRootDirPath)
          .replace(/\\/g, '/')
        if (detailPageLinkToOtherLangRoot === '')
          detailPageLinkToOtherLangRoot = './'
        else if (!detailPageLinkToOtherLangRoot.endsWith('/'))
          detailPageLinkToOtherLangRoot += '/'

        const pageSpecificPathForDetail = 'news/' + article.id + '/'
        const otherLangUrlForDetail =
          detailPageLinkToOtherLangRoot + pageSpecificPathForDetail

        let articleUrlPath = lang === 'ja' ? '/' : `/${lang}/`;
        articleUrlPath += 'news/' + article.id + '/';
        const ogUrlForDetail = SITE_BASE_URL + articleUrlPath;

        const articleDataForTemplate = {
          data: {
            common: commonData,
            pages: pagesData,
            article: article,
          },
          lang: lang,
          assetPath: detailAssetPath,
          pageLinkBasePath: detailPageLinkBasePath,
          pageLinkToOtherLangRoot: detailPageLinkToOtherLangRoot,
          otherLangUrl: otherLangUrlForDetail,
          ogUrl: ogUrlForDetail, 
          pageId: articlePageId,
          currentPageData: article,
        }

        const detailPagePromise = new Promise((resolve, reject) => {
          const templatePath = 'src/ejs/_templates/news-detail-template.ejs'
          fs.readFile(templatePath, 'utf-8', (err, ejsString) => {
            if (err) {
              console.error(
                `[News Detail Template Read Error:${lang}] Error reading ${templatePath}: ${err.message}`,
              )
              return reject({
                lang,
                type: 'news_template_read_error',
                file: templatePath,
                message: err.message,
              })
            }
            try {
              const htmlContent = ejsEngine.render(
                ejsString,
                articleDataForTemplate,
                { filename: templatePath },
              )
              const outputFilePath = path.join(
                detailPageOutputDir,
                'index.html',
              )

              fs.mkdirSync(detailPageOutputDir, { recursive: true })
              fs.writeFile(outputFilePath, htmlContent, (writeErr) => {
                if (writeErr) {
                  console.error(
                    `[News Detail Write Error:${lang}] Error writing ${outputFilePath}: ${writeErr.message}`,
                  )
                  return reject({
                    lang,
                    type: 'news_write_error',
                    file: outputFilePath,
                    message: writeErr.message,
                  })
                }
                resolve({
                  lang: lang,
                  status: 'success_detail',
                  file: outputFilePath,
                })
              })
            } catch (renderErr) {
              console.error(
                `[EJS RENDER (News Detail):${lang}] Error in ${templatePath} for article ${article.id}: ${renderErr.message}`,
              )
              if (renderErr.codeFrame) console.error(renderErr.codeFrame)
              reject({
                lang,
                type: 'news_render_error',
                file: templatePath,
                message: renderErr.message,
                articleId: article.id,
              })
            }
          })
        })
        newsDetailPromises.push(detailPagePromise)
      })
    }
    return [fixedPagesPromise, ...newsDetailPromises]
  })

  Promise.allSettled(allProcessingPromises.flat())
    .then((results) => {
      const errors = results.filter((r) => r.status === 'rejected')
      if (errors.length > 0) {
        errors.forEach((errorResult) => {
          const reason = errorResult.reason || {}
          console.warn(
            `[EJS Build Result] Lang '${reason.lang || 'N/A'}' failed. Type: '${reason.type || 'Unknown'}'. File: '${reason.file || 'N/A'}'. Message: ${reason.message || 'No message'}${reason.articleId ? ` (Article ID: ${reason.articleId})` : ''}`,
          )
        })
        console.warn('[EJS Build] Completed with errors.')
      } else {
        console.log('[EJS Build] All EJS tasks successful.')
      }
      browserSync.reload()
      done()
    })
    .catch((overallError) => {
      console.error(
        '[EJS Build] Overall Promise.allSettled error:',
        overallError,
      )
      done(overallError)
    })
}

function compileSass() {
  return gulp
    .src('src/assets/scss/style.scss')
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.error('Sass Error:', err.message)
          if (err.formatted) console.error(err.formatted)
          this.emit('end')
        },
      }),
    )
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssDeclarationSorter({ order: 'smacss' })]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('docs/assets/css'))
    .pipe(browserSync.stream())
}

function compileJS() {
  return gulp
    .src('src/assets/js/main.js')
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.error('Webpack Error:', err.message)
          this.emit('end')
        },
      }),
    )
    .pipe(
      webpackStream(
        {
          mode: process.env.NODE_ENV || 'production',
          output: { filename: 'bundle.js' },
          module: {
            rules: [
              {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: { presets: ['@babel/preset-env'] },
                },
              },
            ],
          },
          devtool:
            process.env.NODE_ENV === 'development' ? 'source-map' : false,
        },
        webpack,
      ),
    )
    .pipe(gulp.dest('docs/assets/js'))
    .pipe(browserSync.stream())
}

function optimizeImages() {
  console.log('[OptimizeImages] Task started.')
  const dest = 'docs/assets/images'

  return gulp
    .src('src/assets/images/**/*.{jpg,jpeg,png,svg}')
    .pipe(changed(dest))
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.error('OptimizeImages Error:', err.toString())
          this.emit('end')
        },
      }),
    )
    .pipe(
      imagemin([
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        }),
      ]),
    )
    .pipe(gulp.dest(dest))
    .on('end', function () {
      console.log('[OptimizeImages] Task finished successfully.')
    })
}

function convertToWebp() {
  console.log('[ConvertToWebp] Task started.')
  const dest = 'docs/assets/images'

  return gulp
    .src('src/assets/images/**/*.{jpg,jpeg,png}')
    .pipe(changed(dest, { extension: '.webp' }))
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.error('ConvertToWebp Error:', err.toString())
          this.emit('end')
        },
      }),
    )
    .pipe(
      imagemin([imageminWebp({ quality: 75 })]),
    )
    .pipe(rename({ extname: '.webp' }))
    .pipe(gulp.dest(dest))
    .on('end', function () {
      console.log('[ConvertToWebp] Task finished successfully.')
    })
}

function serve() {
  browserSync.init({
    server: 'docs',
    port: 3000,
    notify: false,
    open: true,
    ghostMode: true,
  })

  gulp.watch('src/ejs/**/*.ejs', buildEJS)
  gulp.watch('src/locales/**/*.json', buildEJS)
  gulp.watch('src/assets/scss/**/*.scss', compileSass)
  gulp.watch('src/assets/js/**/*.js', compileJS)
  gulp.watch(
    'src/assets/images/**/*.{jpg,jpeg,png,gif,svg}',
    gulp.series(optimizeImages, convertToWebp),
  )
}

exports.build = gulp.series(
  buildEJS,
  compileSass,
  compileJS,
  optimizeImages,
  convertToWebp,
)

exports.optimizeImages = optimizeImages
exports.convertToWebp = convertToWebp
exports.compileJS = compileJS
exports.compileSass = compileSass
exports.buildEJS = buildEJS

exports.serve = gulp.series(exports.build, serve)
exports.default = exports.serve