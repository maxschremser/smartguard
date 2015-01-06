var express = require('express');
var stormpath = require('express-stormpath');
var csurf = require('csurf');
var properties = require('properties'), hue_ipaddress, hue_user, num_hues = 0, hue_on = false;
var hue_api = require('node-hue-api');
var naturaltime = require('naturaltime');
var HueApi = hue_api.HueApi;

// read api endpoint and secretKey from configFile
properties.parse('./config.properties', {path: true}, function(err, cfg) {
  if (err) {
    console.error('A file named config.properties containing the API endpoint is missing.');
    console.error('The file must contain the following properties: apikey and apitoken. For ' +
    'the HUE Lights it must contain hue_ipaddress and hue_user properties.');
    throw e;
  }
  hue_ipaddress = cfg.hue_ipaddress;
  hue_user = cfg.hue_user;
});

var displayLights = function(result) {
  console.log("LightState: " + JSON.stringify(result));
  num_hues = result.lights.length;
};

// exports a function that will render the GUI for the lights
module.exports = function hue() {
  console.log("hue route setup");
  var router = express.Router();
  router.use(csurf());

  // capture all requests from the GUI
  router.get('/', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    // finding the lights
    if (num_hues <= 0)
      api.lights().then(displayLights).done();

    // query "state.on" for the transitions
    api.lightStatus(1).then(function(result){hue_on = result.state.on;}).done();
    // console.log("1:" + hue_on);
    res.render('hue', {title: "Philips HUE Lights Control", num_hues: num_hues});
  });

  // turn the lights red
  router.get('/red', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(200,0,0) : states.create().on().transition(7).rgb(255,0,0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#red');
  });

  // turn the lights green
  router.get('/green', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(0,200,0) : states.create().on().transition(7).rgb(0,255,0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#green');
  });

  // turn the lights blue
  router.get('/blue', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(0,0,200) : states.create().on().transition(7).rgb(0,0,255).brightness(100);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#blue');
  });

  // turn the lights yellow
  router.get('/yellow', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(255,216,0) : states.create().on().transition(7).rgb(255,216,0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#yellow');
  });

  // turn the lights white
  router.get('/white', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).white(300,60) : states.create().on().transition(7).white(300,60);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#white');
  });


  // turn off the lights
  router.get('/off', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(hue_ipaddress, hue_user);
    var states = hue_api.lightState;
    var state = states.create().off();
    // finding the lights
    // api.lights().then(displayLights).done();
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#off');
  });
  return router;
};
/* GET users listing. */
/*
router.all('/', stormpath.loginRequired, function(req, res) {
  console.log("hue route setup");
  var api = new HueApi(hue_ipaddress, hue_user);
  var states = hue.lightState;

  // finding the lights
  api.lights().then(displayLights).done();

  var mode = req.params.mode;
  console.log(naturaltime('1 minutes') + 'Request:' +  req);
  var state = states.create().off();

  if (mode && "On" == mode) {
    state = states.create().on().white(500, 100);
  }
  if (mode && "Alert" == mode) {
    state = states.create().on().alert();
  }

  api.setLightState(1, state);
  api.setLightState(2, state);
  res.send('{"return":"success","value":' + mode + '}');

});

router.get('/Brightness/:value', function(req, res) {
  var api = new HueApi(hue_ipaddress, hue_user);
  var states = hue.lightState;

  // finding the lights
  api.lights().then(displayLights).done();

  var value = req.params.value;
  console.log(naturaltime('1 minutes') + 'Value:' +  value);

  state = states.create().on().brightness(value);

  api.setLightState(1, state);
  api.setLightState(2, state);
  res.send('{"return":"success","Value":' + mode + '}');

});
*/
