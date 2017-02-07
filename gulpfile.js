var gulp = require('gulp'),
    ts = require("gulp-typescript"),
    tsProject = ts.createProject("tsconfig.json");

var exec = require('child_process').exec;

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
gulp.task('run', ['default'], function() {
    return exec('node server.js', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});