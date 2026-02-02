var express = require('express');
var router = express.Router();
var Client = require('../models/client.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
const clients = Client.list;
  res.send(clients);
});
router.post('/', function(req, res, next) {
  const { name, email, phone } = req.body;
  const client = Client.createClient(name, email, phone);
  res.send(client);
});
module.exports = router;