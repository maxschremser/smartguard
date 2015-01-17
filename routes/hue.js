var express = require('express');
var stormpath = require('express-stormpath');
var csurf = require('csurf');
var num_hues = 0, hue_on = false;
var hue_api = require('node-hue-api');
var HueApi = hue_api.HueApi;
var cfg = require("../config.json");

function displayLights(result) {
  
}

// exports a function that will render the GUI for the lights
module.exports = function hue() {
  console.log("hue route setup");
  var router = express.Router();
  router.use(csurf());

  // capture all requests from the GUI
  router.get('/', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
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
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(200,0,0) : states.create().on().transition(7).rgb(255,0,0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#red');
  });

  // turn the lights green
  router.get('/green', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(0,200,0) : states.create().on().transition(7).rgb(0,255,0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#green');
  });

  // turn the lights blue
  router.get('/blue', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).xy(0.0, 0.0) : states.create().on().transition(7).xy(0.0, 0.0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#blue');
  });

  // turn the lights yellow
  router.get('/yellow', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).rgb(255,216,0) : states.create().on().transition(7).rgb(255,216,0);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#yellow');
  });

  // turn the lights white
  router.get('/white', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
    var states = hue_api.lightState;
    var state = hue_on ? states.create().transition(7).white(300,100) : states.create().on().transition(7).white(300,100);
    api.setLightState(1, state);
    api.setLightState(2, state);

    res.redirect('/hue#white');
  });


  // turn off the lights
  router.get('/off', stormpath.loginRequired, function(req, res) {
    var api = new HueApi(cfg.hue.ip_address, cfg.hue.user);
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
