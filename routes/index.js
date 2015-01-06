var express = require('express');

/* GET home page. */
module.exports = function index() {
  console.log("index route setup");
  var router = express.Router();

  router.get('/', function (req, res) {
    res.render('index', {title: 'SmartGuard Web Control'});
  });

  return router;
}
