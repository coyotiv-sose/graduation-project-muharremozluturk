var express = require('express');
var router = express.Router();
const Session = require('../models/session.js');
const Expert = require('../models/expert.js')
const Client = require('../models/client.js')
const mongoose = require('mongoose');

/* GET session listing. */
router.get('/', async function (req, res, next) {
  res.send(await Session.find());
});

/* Get session*/
router.get('/:sessionId', async function (req, res, next) {
  const { sessionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(sessionId)) {
    return res.status(404).json('Session not found');
  }
  const session = await Session.findById(sessionId)

  if (!session) return res.status(404).json('Session not found')

  res.send(session)
});

/* Create Session */
router.post('/', async function (req, res, next) {
  const expert = await Expert.findById(req.body.expert)
  const session = await expert.createSession(req.body.startTime, req.body.endTime);
  res.send(session);
});

/* Book Session */

router.post('/:sessionId/client', async function (req, res, next) {
  const client = await Client.findById(req.body.client)
  const session = await Session.findById(req.params.sessionId)
  try {
    await client.bookSession(session)
    res.send(session);
  } catch (error) {
    return res.status(400).json(error.message);
  }
})

/* Cancel Booking */

router.delete('/:sessionId/client', async function (req, res, next) {
  const client = await Client.findById(req.body.client)
  const session = await Session.findById(req.params.sessionId)
  try { 
    await client.cancelBooking(session)
    res.send(session);
  } catch (error) {
    return res.status(400).json(error.message);
  }
})

/* Cancel Session */

router.delete('/:sessionId', async function (req, res, next) {
  const expert = await Expert.findById(req.body.expert)
  const session = await Session.findById(req.params.sessionId)
  try {
    await expert.cancelSession(session)
    res.send(session);
  } catch (error) {
    return res.status(400).json(error.message);
  }
})

module.exports = router;
