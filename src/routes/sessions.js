var express = require('express');
var router = express.Router();
var Session = require('../models/session.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
  const sessions = Session.list;
  res.send(sessions);
});

module.exports = router;
