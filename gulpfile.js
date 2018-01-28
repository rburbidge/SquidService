var argv = require('yargs').argv,
    gulp = require('gulp'),
    ftp = require( 'vinyl-ftp'),
    gutil = require('gulp-util');

var exec = require('child_process').exec;

function createFtpConfig() {
    return {
        host:     argv.host,
        user:     argv.user,
        password: argv.pass,
        parallel: 10,
        log:      gutil.log
    };
}

// Deploys the production.json config file to Azure
gulp.task('deployProdConfig', function() {
    var conn = ftp.create(createFtpConfig());
 
    return gulp
        .src('./config/production.json')
        .pipe(conn.dest('./site/wwwroot/config'));
});