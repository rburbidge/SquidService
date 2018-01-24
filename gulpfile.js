var argv = require('yargs').argv,
    gulp = require('gulp'),
    ftp = require( 'vinyl-ftp'),
    gutil = require('gulp-util'),
    ts = require("gulp-typescript"),
    tsProject = ts.createProject("tsconfig.json");

var exec = require('child_process').exec;

var azureFtpUrl = '';

gulp.task('default', ['transpile']);

// Clean everything except the node_modules
gulp.task('clean', function(cb) {
    return exec('git clean -fxd -e node_modules', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

// Build TypeScript
gulp.task('transpile', ['clean'], function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("."));
});

// Run the server
// Note that currently this doesn't show the node logs for some reason
gulp.task('run', ['default'], function(cb) {
    return exec('node server.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});

function createFtpConfig() {
    return {
        host:     'waws-prod-sn1-025.ftp.azurewebsites.windows.net',
        user:     'SirNommington\\' + argv.user , // Note the escaped backslash
        password: argv.pass,
        parallel: 10,
        log:      gutil.log
    };
}

// Deploys the node_modules/@types folder to Azure. Needed because Azure will fail to npm install those packages for
// some reason.
gulp.task('deployTypes', function() {
    var conn = ftp.create(createFtpConfig());
 
    return gulp
        .src('node_modules/@types/*', { base: '.', buffer: false })
        .pipe(conn.dest('./site/wwwroot/')); 
});

// Deploys the production.json config file to Azure
gulp.task('deployProdConfig', function() {
    var conn = ftp.create(createFtpConfig());
 
    return gulp
        .src('./config/production.json')
        .pipe(conn.dest('./site/wwwroot/config'));
});