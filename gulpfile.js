'use strict';

/*Gulp, практически автономен, изменять практически нечего*/

const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');
const cleancss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const fonter = require('gulp-fonter-2');
const t2w2 = require('gulp-ttf2woff2');
const fs = require('node:fs');
const include = require('gulp-file-include');

const path = {

    styles: {
        input: ['app/scss/**/*.scss', '!app/scss/**/*_.scss', '!app/scss/**/_*.scss'],
        output: "dist",
        min: 'dist/css/**/*.min.css',
        watch: ['app/scss/**/*.scss']
    },

    scripts: {
        input: ['app/js/**/*.js'],
        output: "dist/css",
        min: 'dist/js/**/*.min.js',
        watch: ['app/js/**/*.js']
    },

    img: {
        input: 'app/img/**/*.*',
        output: 'dist',
        watch: ['app/img/**/*.*']
    },

    html: {
        input: 'app/*.html',
        output: 'dist',
        watch: ['app/**/*.html']
    },

    fonts: {
        ttfInput: 'app/fonts/*.ttf',
        otfInput: 'app/fonts/*.otf',
        oneOutput: 'app/fonts',
        twoOutput: 'dist/fonts',
        copy: 'app/fonts/*.{woff,woff2}'
    },

    static: {
        input: 'app/static/**/*.*',
        watch: 'app/static/**/*.*',
        output: 'dist'
    }
};

function styles() {
    return src(path.styles.input, {
            base: 'app/scss'
        })
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(scss.sync({
            outputStyle: "compressed"
        }).on('error', scss.logError))
        .pipe(rename({
            extname: ".min.css"
        }))
        .pipe(sourcemaps.write())
        .pipe(dest(path.styles.output))
        .pipe(browserSync.stream());
};

function scripts() {
    return src(path.scripts.input, {
            base: 'app'
        })
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            extname: ".min.js"
        }))
        .pipe(sourcemaps.write())
        .pipe(dest(path.scripts.output))
        .pipe(browserSync.stream());
};

function delSMCSS() {
    return src(path.styles.min, {
            base: 'dist/css'
        })
        .pipe(cleancss({
            level: {
                1: {
                    specialComments: 0
                }
            }
        }))
        .pipe(dest(path.styles.output));
};

function delSMJS() {
    return src(path.scripts.min, {
            base: 'dist'
        })
        .pipe(uglify())
        .pipe(dest(path.scripts.output));
};

function cleanDist() {
    return src("dist")
        .pipe(clean());
};

function imageMin() {
    return src(path.img.input, {
            base: 'app'
        })
        .pipe(newer('dist'))
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest(path.img.output))
        .pipe(browserSync.stream());
};

function watching() {
    watch(path.styles.watch, styles);
    watch(path.scripts.watch, scripts);
    watch(path.img.watch, imageMin);
    watch(path.html.watch, htmlBuild);
    watch(path.static.watch, buildOtherFile);
};

function browsersync() {
    browserSync.init({
        server: {
            baseDir: "dist/"
        }
    });
};

function oftToTtf() {
    return src(path.fonts.otfInput)
        .pipe(fonter({
            formats: ['ttf']
        }))
        .pipe(dest(path.fonts.oneOutput))
        .pipe(dest(path.fonts.twoOutput));
};

function ttfToWoff() {
    return src(path.fonts.ttfInput)
        .pipe(fonter({
            formats: ['woff']
        }))
        .pipe(dest(path.fonts.oneOutput))
        .pipe(dest(path.fonts.twoOutput))
        .pipe(src(path.fonts.ttfInput))
        .pipe(t2w2())
        .pipe(dest(path.fonts.oneOutput))
        .pipe(dest(path.fonts.twoOutput));
};

function writeFonts() {
    try {
        const fontsFile = "app/scss/fonts_.scss";
        fs.readdir("app/fonts", (err, fontFiles) => {
            if (err) throw err;
            else if (fontFiles.length === 0) console.log("Fonts were not found!");
            if (!fs.existsSync(fontsFile)) {
                fs.writeFile(fontsFile, '', err => {
                    if (err) throw err
                });
                let newFile;
                fontFiles.forEach(fontFile => {
                    const fontFileName = fontFile.split(".")[0];
                    const fontFileType = fontFile.split(".")[1];
                    if (fontFileType === "ttf" || fontFileType === "oft" || fontFileType === "woff") console.log(`File ${fontFile} was ignored due to the format!`);
                    else if (newFile === fontFile) console.log("File ${fontFile} was ignored due to lack of uniqueness!");
                    else {
                        fs.appendFile(fontsFile, `@font-face {\n\tfont-family: "${fontFileName}";\n\tsrc: url("../fonts/${fontFile}");\n\tfont-style: normal;\n}\n`, err => {
                            if (err) throw err
                        });
                        newFile = fontFile;
                    };
                });
                return;
            } else console.log(`File ${fontsFile} already exists!`);
        });
    } catch (err) {
        console.log(err);
    };
};

function htmlBuild() {
    return src(path.html.input)
        .pipe(include({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest(path.html.output))
        .pipe(browserSync.stream());
};

function buildOtherFile() {
    return src(path.static.input, {
            base: 'app'
        })
        .pipe(dest(path.static.output))
        .pipe(browserSync.stream());
};

function copyFonts() {
    return src(path.fonts.copy)
        .pipe(dest(path.fonts.twoOutput))
        .pipe(browserSync.stream());
};

exports.dev = series(cleanDist, copyFonts, parallel(scripts, styles), htmlBuild, buildOtherFile, imageMin);
exports.add_fonts = series(oftToTtf, ttfToWoff, writeFonts);
exports.watch_brow = parallel(watching, browsersync);
exports.prod = series(cleanDist, copyFonts, parallel(scripts, styles), parallel(delSMCSS, delSMJS), htmlBuild, buildOtherFile, imageMin);