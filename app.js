var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stormpath = require('express-stormpath');
//var routes = require('./routes/index');
//var users = require('./routes/users');
var profile = require('./routes/profile')();
// var secretkey = require('secretkey');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: path.join(__dirname, '.stormpath') + '/apiKey.properties',
  application: 'https://api.stormpath.com/v1/applications/6MtnbKJ9p5FtISeUK7KItV',
  secretKey: 'changeit',
  expandCustomData: true,
  enableForgotPassword: true
});

app.use(stormpathMiddleware);

//app.use('/', routes);
//app.use('/users', users);
app.use('/profile', profile);

module.exports = app;
