var express = require('express');
var router = express.Router();
var Client = require('../models/client.js');
var Session = require('../models/session.js');
/* GET users listing. */
router.get('/', function(req, res, next) {
const clients = Client.list;
  res.send(clients);
});
router.post('/', function(req, res, next) {
  const { name, email, phone } = req.body;
  const client = Client.create({name, email, phone});
  res.send(client);
});
router.get('/:id', function(req, res, next) {
  const { id } = req.params;
  const client = Client.list.find(client => client.id === id);
  if (!client) {
    return res.status(404).send({ error: 'Client not found' });
  }
  res.send(client);
});

router.post('/:id/sessions/:sessionId/participants', function(req, res, next) {
  const { id, sessionId } = req.params;
  const client = Client.list.find(client => client.id === id);
  if (!client) {
    return res.status(404).send({ error: 'Client not found' });
  }
  const session = Session.list.find(session => session.id === sessionId);
  if (!session) {
    return res.status(404).send({ error: 'Session not found' });
  }
  const bookedSession = client.bookSession(session);
  res.send({sessionId: sessionId});
});

module.exports = router;