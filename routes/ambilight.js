var express = require('express'),
    stormpath = require('express-stormpath'),
    csurf = require('csurf'),
    cfg = require('../config.json'),
    ambi,
    AmbilightApi = require('ambilight').AmbilightApi,
    hue,
    hue_api = require('node-hue-api'),
    HueApi = hue_api.HueApi,
    pJ = require('prettyjson'),
    bLightsOn = false,
    _TIMEOUT = 300,
    _GOTO_BED = 50000,
    _tvOn = false,
    _ambilightOn = true,
    getMeasuredLight = function (obj, light) {
      for (var o in obj) {
        if (o == light) {
          return obj[o];
        }
      }
    },
    controlHUE = function (measured) {
      if (measured && _ambilightOn) {
        // I have two HUE Lights (1 and 2)
        _tvOn = true;
        var state1, state2;
        var states = hue_api.lightState;

        if (!bLightsOn) {
          console.log("");
          console.log("Ambilight Server is up and runnging ...".green);
          bLightsOn = !bLightsOn;
          state1 = states.create().on();
          state2 = states.create().on();

          hue.setLightState(1, state1);
          hue.setLightState(2, state2);
        }

        var color1 = getMeasuredLight(measured.layer1.left, 4);
        var color2 = getMeasuredLight(measured.layer1.right, 4);
        // console.log("1:" + JSON.stringify(color1) + ", :" + JSON.stringify(color2) + "\n--");
        state1 = states.create().transition(_TIMEOUT / 1000).rgb(color1.r, color1.g, color1.b);
        state2 = states.create().transition(_TIMEOUT / 1000).rgb(color2.r, color2.g, color2.b);

        hue.setLightState(1, state1);
        hue.setLightState(2, state2);
      }
    };

ambi = new AmbilightApi(cfg.tv.ip_address);
hue = new HueApi(cfg.hue.ip_address, cfg.hue.user);

setInterval(function(){ambi.getMeasured().then(controlHUE).done();}, _TIMEOUT);

// exports a function that will render the GUI for the lights
module.exports = function ambilight() {
  console.log("ambilight route setup");

  var router = express.Router();
  
  hue.getVersion().then(function (result) {
    console.log("HUE Connection: \r\n".yellow + pJ.render(result));
  }).done();

  ambi.getSystemName().then(function (result) {
    console.log("Ambilight TV Connection: ".yellow + pJ.render(result));
  }).
      then(ambi.getSystemSoftwareversion().then(function (result) {
        console.log("Ambilight TV Connection: ".yellow + pJ.render(result));
      })).
      then(ambi.getSystemModel().then(function (result) {
        console.log("Ambilight TV Connection: ".yellow + pJ.render(result));
      })).
      then(ambi.getSystemSerialnumber().then(function (result) {
        console.log("Ambilight TV Connection: ".yellow + pJ.render(result));
      })).
      done();

  router.use(csurf());

  // capture all requests from the GUI
  router.get('/', stormpath.loginRequired, function(req, res) {
    res.render('ambilight', {title: "Philips Ambilight Control"});
  });

  router.get('/on', stormpath.loginRequired, function(req, res) {
    _ambilightOn = true;
    console.log("Ambilight turned ON");
    res.send({"mode": "on"});
  });

  router.get('/off', stormpath.loginRequired, function(req, res) {
    _ambilightOn = false;
    console.log("Ambilight turned OFF");
    res.send({"mode": "off"});
  });

  return router;
};
