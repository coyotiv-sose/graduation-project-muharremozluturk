var express = require('express');
var router = express.Router();
const Client = require('../models/client.js');
const Session = require('../models/session.js');
const mongoose = require('mongoose');
/* GET users listing. */

router.get('/', async function(req, res, next) {
  res.send(await Client.find())
});

router.post('/', async function(req, res, next) {
  const { name, email, phone } = req.body;
  const client = await Client.create({name, email, phone});
  res.send(client);
});

router.get('/:id', async function(req, res, next) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Client not found');
  }

  const client = await Client.findById(id);

  if (!client) return res.status(404).json('Client not found');

  res.send(client);
});



module.exports = router;