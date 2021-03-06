var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var stormpath = require('express-stormpath');
var app = express();
var index = require('./routes')();
var ambilight = require('./routes/ambilight')();
var profile = require('./routes/profile')();
var hue = require('./routes/hue')();

var cfg = require("./config.json"),
    application = cfg.application;
    secretKey = cfg.secretKey;


app.configure
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

var stormpathMiddleware = stormpath.init(app, {
  apiKeyFile: path.join(__dirname, '.stormpath') + '/apiKey.properties',
  application: application,
  secretKey: secretKey,
  expandCustomData: true,
  enableForgotPassword: true
});

app.use(stormpathMiddleware);

app.use('/', index);
app.use('/hue', hue);
app.use('/ambilight', ambilight);
app.use('/profile', profile);

// send the index view on start
app.get('/', function(req, res) {
  res.render('index', {"title": "SmartGuard - WebControl"});
});

module.exports = app;
