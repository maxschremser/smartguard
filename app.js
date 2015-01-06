var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var stormpath = require('express-stormpath');
var properties = require('properties');
var application = "", secretKey = "";
var app = express();
var index = require('./routes')();
var profile = require('./routes/profile')();
var hue = require('./routes/hue')();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// read api endpoint and secretKey from configFile
properties.parse('./config.properties', {path: true}, function(err, cfg) {
  if (err) {
    console.error('A file named config.properties containing the API endpoint is missing.');
    console.error('The file must contain the following properties: apikey and apitoken.');
    throw e;
  }
  application = cfg.application;
  secretKey = cfg.secretKey;
});

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
app.use('/profile', profile);

// send the index view on start
app.get('/', function(req, res) {
  res.render('index', {"title": "SmartGuard - WebControl"});
});

module.exports = app;
