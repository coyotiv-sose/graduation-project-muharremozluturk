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
  const expert = Expert.create({name, email, phone, specialization, hourlyRate});
  res.send(expert);
});

router.get('/:id', function(req, res, next) {
  const { id } = req.params;
  const expert = Expert.list.find(expert => expert.id === id);
  if (!expert) {
    return res.status(404).send({ error: 'Expert not found' });
  }
  res.send(expert);
});
router.post('/:id/sessions', function(req, res, next) {
  const { id } = req.params;
  const expert = Expert.list.find(expert => expert.id === id);
  if (!expert) {
    return res.status(404).send({ error: 'Expert not found' });
  }
  const { startTime, endTime, status, maxParticipants } = req.body;
  const session = expert.createSession(startTime, endTime, status, maxParticipants);


  res.send({startTime: startTime, endTime: endTime, status: status, maxParticipants: maxParticipants});
});

router.get('/:id/sessions', function(req, res, next) {
  const { id } = req.params;
  const expert = Expert.list.find(expert => expert.id === id);
  if (!expert) {
    return res.status(404).send({ error: 'Expert not found' });
  }
  const sessions = expert.availableSessions.map(session => session.getSessionInfo());
  res.send(sessions);
});
module.exports = router;