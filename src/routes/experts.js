var express = require('express');
var router = express.Router();
var Expert = require('../models/expert.js');

/* GET users listing. */
router.get('/', async function(req, res, next) {
  res.send(await Expert.find());
});

router.post('/', async function(req, res, next) {
  const { name, email, phone, specialization, hourlyRate } = req.body;
  const expert = await Expert.create({name, email, phone, specialization, hourlyRate});
  res.send(expert);
});

router.get('/:id', async function(req, res, next) {
  const expert = await Expert.findById(req.params.id)

  if (!expert) return res.status(404).send('Expert not found')

  res.send(expert)
});

// router.post('/:id/sessions', function(req, res, next) {
//   const { id } = req.params;
//   const expert = Expert.list.find(expert => expert.id === id);
//   if (!expert) {
//     return res.status(404).send({ error: 'Expert not found' });
//   }
//   const { startTime, endTime, status } = req.body;
//   const session = expert.createSession(startTime, endTime, status);


//   res.send({startTime: startTime, endTime: endTime, status: status});
// });

// router.get('/:id/sessions', function(req, res, next) {
//   const { id } = req.params;
//   const expert = Expert.list.find(expert => expert.id === id);
//   if (!expert) {
//     return res.status(404).send({ error: 'Expert not found' });
//   }
//   const sessions = expert.sessions.map(session => session.getSessionInfo());
//   res.send(sessions);
// });
module.exports = router;