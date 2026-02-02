var express = require('express');
var router = express.Router();
var Expert = require('../models/expert.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
  const experts = Expert.list;
  res.send(experts);
});
router.post('/', function(req, res, next) {
  const { name, email, phone, specialization, hourlyRate } = req.body;
  const expert = Expert.createExpert(name, email, phone, specialization, hourlyRate);
  res.send(expert);
});
module.exports = router;