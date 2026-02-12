var express = require('express');
var router = express.Router();
const Client = require('../models/client.js');
const Session = require('../models/session.js');
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
  const client = await Client.findById(req.params.id)

  if (!client) return res.status(404).send('Client not found')

  res.send(client)
});

router.post('/:id/sessions/:sessionId/participants', function(req, res, next) {
  //TODO
  res.send("")
});

module.exports = router;