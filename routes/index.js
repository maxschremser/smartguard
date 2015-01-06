var express = require('express');

/* GET home page. */
module.exports = function index() {
  var router = express.Router();

  router.get('/', function (req, res) {
    res.render('index', {title: 'SmartGuard Web Control'});
  });

  console.log("index route setup");
  return router;
}
