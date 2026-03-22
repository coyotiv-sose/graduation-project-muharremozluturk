var express = require('express');
var router = express.Router();
const Appointment = require('../models/appointment.js');
const Expert = require('../models/expert.js')
const Client = require('../models/client.js')
const mongoose = require('mongoose');

/* GET appointment listing. */
router.get('/', async function (req, res, next) {
  res.send(await Appointment.find());
});

/* Get appointment */
router.get('/:appointmentId', async function (req, res, next) {
  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(404).json('Appointment not found');
  }
  const appointment = await Appointment.findById(appointmentId)

  if (!appointment) return res.status(404).json('Appointment not found')

  res.send(appointment)
});

/* Create appointment */
router.post('/', async function (req, res, next) {
  const expert = await Expert.findById(req.body.expert)
  const appointment = await expert.createAppointment(req.body.startTime, req.body.endTime);
  res.send(appointment);
});

/* Book appointment */

router.post('/:appointmentId/client', async function (req, res, next) {
  const client = await Client.findById(req.body.client)
  const appointment = await Appointment.findById(req.params.appointmentId)
  try {
    await client.bookAppointment(appointment)
    res.send(appointment);
  } catch (error) {
    return res.status(400).json(error.message);
  }
})

/* Cancel booking */

router.delete('/:appointmentId/client', async function (req, res, next) {
  const client = await Client.findById(req.body.client)
  const appointment = await Appointment.findById(req.params.appointmentId)
  try { 
    await client.cancelBooking(appointment)
    res.send(appointment);
  } catch (error) {
    return res.status(400).json(error.message);
  }
})

/* Cancel appointment (expert) */

router.delete('/:appointmentId', async function (req, res, next) {
  const expert = await Expert.findById(req.body.expert)
  const appointment = await Appointment.findById(req.params.appointmentId)
  try {
    await expert.cancelAppointment(appointment)
    res.send(appointment);
  } catch (error) {
    return res.status(400).json(error.message);
  }
})

module.exports = router;
