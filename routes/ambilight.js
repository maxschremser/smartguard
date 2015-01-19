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
    _bLightsOn = false,
    _TIMEOUT = 300,
    _turnOffTime = 60,
    _tvOn = false,
    _ambilightOn = true,
    _ambilightSync = true,
    _method = "processed",
    _responseTime = [],
    _startTime = 0,
    _endTime = 0,
    getLight = function (obj, light) {
      for (var o in obj) {
        if (o == light) {
          return obj[o];
        }
      }
    },
    handleError = function(error) {
      // TV might be off, turn off lights
      console.log(JSON.stringify(error));
      var states = hue_api.lightState;
      hue.setLightState(1, states.create().transition(_turnOffTime).off());
      hue.setLightState(2, states.create().transition(_turnOffTime).off());
      setTimeout(function () {
        hue.setLightState(1, states.create().off());
        hue.setLightState(2, states.create().off());
        _bLightsOn = false;
      }, _turnOffTime * 1000);
    },
    controlHUE = function (measured) {
      if (measured && _ambilightOn) {
        // I have two HUE Lights (1 and 2)
        _tvOn = true;
        var state1, state2;
        var states = hue_api.lightState;

        if (!_bLightsOn) {
          console.log("");
          console.log("Ambilight Server is up and runnging ...".green);
          _bLightsOn = true;
          state1 = states.create().on();
          state2 = states.create().on();

          hue.setLightState(1, state1);
          hue.setLightState(2, state2);
        }

        var color1 = getLight(measured.layer1.left, 4);
        var color2 = getLight(measured.layer1.right, 4);
        // console.log("1:" + JSON.stringify(color1) + ", :" + JSON.stringify(color2) + "\n--");
        state1 = states.create().transition(_TIMEOUT / 1000).rgb(color1.r, color1.g, color1.b);
        state2 = states.create().transition(_TIMEOUT / 1000).rgb(color2.r, color2.g, color2.b);

        hue.setLightState(1, state1);
        hue.setLightState(2, state2);
        _endTime = new Date().getTime();
        _responseTime.push(_endTime - _startTime);
      }
    };

Array.prototype.average=function(){
  var sum=0;
  var j=0;
  for(var i=0;i<this.length;i++){
    if(isFinite(this[i])){
      sum=sum+parseFloat(this[i]);
      j++;
    }
  }
  if (j > 100) {
    // empty array and set initial value to average
    this.length = 0;
    this.push(sum/j);
    return sum/j;
  }
  if(j===0){
    return 0;
  }else{
    return sum/j;
  }

};

ambi = new AmbilightApi(cfg.tv.ip_address);
hue = new HueApi(cfg.hue.ip_address, cfg.hue.user);

setInterval(function(){
  _startTime = new Date().getTime(); // ms
  if (_method == "measured") {
    ambi.getMeasured().then(controlHUE).catch(handleError).done();
  } else {
    ambi.getProcessed().then(controlHUE).catch(handleError).done();
  }
}, _TIMEOUT);

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
    console.log("Ambilight turned ON");
    _ambilightOn = true;
    res.send({"mode": "on"});
  });

  router.get('/off', stormpath.loginRequired, function(req, res) {
    console.log("Ambilight turned OFF");
    _ambilightOn = false;
    res.send({"mode": "off"});
  });

  router.get('/measured', stormpath.loginRequired, function(req, res) {
    console.log("Ambilight using measured values");
    _method = "measured";
    res.send({"method": "measured"});
  });

  router.get('/processed', stormpath.loginRequired, function(req, res) {
    console.log("Ambilight using processed values");
    _method = "processed";
    res.send({"method": "processed"});
  });

  router.get('/sync', stormpath.loginRequired, function(req, res) {
    console.log("Ambilight will turn off HUEs");
    _ambilightSync = true;
    res.send({"sync": "sync"});
  });

  router.get('/no-sync', stormpath.loginRequired, function(req, res) {
    console.log("Ambilight will not turn off HUEs");
    _ambilightSync = false;
    res.send({"sync": false});
  });

  router.get('/turnOffTime/*', stormpath.loginRequired, function(req, res) {
    var value = req;
    console.log("turnOffTime = " + JSON.stringify(value));
    _turnOffTime = value;
    res.send({"turnOffTime" : value});
  });

  router.get('/status', stormpath.loginRequired, function(req, res) {
    var avg = _responseTime.average();
     res.send({"status": {
       "on": _ambilightOn,
       "method": _method,
       "sync": _ambilightSync,
       "turnOffTime": _turnOffTime,
       "avgResponseTime": avg
     }})
  });
  return router;
};
