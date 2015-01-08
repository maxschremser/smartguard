var express = require('express');
var stormpath = require('express-stormpath');
var csurf = require('csurf');
var properties = require('properties'), tv_on = false, tv_ipaddress, num_tvs = 0;
var ambi = require('ambilight');
var AmbilightApi = ambi.AmbilightApi;

// read api endpoint and secretKey from configFile
properties.parse('./config.properties', {path: true}, function(err, cfg) {
  if (err) {
    console.error('A file named config.properties containing the API endpoint is missing.');
    console.error('The file must contain the following properties: apikey and apitoken. For ' +
    'the HUE Lights it must contain hue_ipaddress and hue_user properties.');
    throw e;
  }
  tv_ipaddress = cfg.tv_ipaddress;
});

var displayLights = function(result) {
  console.log("Topology: " + JSON.stringify(result));
  num_tvs = result.left + result.right + result.top + result.bottom;
};

// exports a function that will render the GUI for the lights
module.exports = function ambilight() {
  console.log("ambilight route setup");
  var router = express.Router();
  router.use(csurf());

  // capture all requests from the GUI
  router.get('/', stormpath.loginRequired, function(req, res) {
    var api = new AmbilightApi(tv_ipaddress);
    // finding the lights
    //if (num_tvs <= 0)
    api.ambilights().then(displayLights).done();

    res.render('ambilight', {title: "Philips Ambilight Control"});
  });

  return router;
};
