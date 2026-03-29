var express = require('express');
var router = express.Router();
const Appointment = require('../models/appointment.js');
const Expert = require('../models/expert.js')
const Client = require('../models/client.js')
const mongoose = require('mongoose');
const { sanitizeAppointmentForRequest } = require('../utils/appointmentResponse.js');

/* GET appointment listing. */
router.get('/', async function (req, res, next) {
  try {
    const appointments = await Appointment.find();
    res.send(appointments.map((a) => sanitizeAppointmentForRequest(a, req)));
  } catch (err) {
    next(err);
  }
});

/* Get appointment */
router.get('/:appointmentId', async function (req, res, next) {
  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(404).json('Appointment not found');
  }
  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) return res.status(404).json('Appointment not found');

    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (err) {
    next(err);
  }
});

/* Create appointment */
router.post('/', async function (req, res, next) {
  try {
    const expert = await Expert.findById(req.body.expert);
    const appointment = await expert.createAppointment(req.body.startTime, req.body.endTime);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (err) {
    next(err);
  }
});

/* Book appointment */

router.post('/:appointmentId/client', async function (req, res, next) {
  const client = await Client.findById(req.body.client);
  const appointment = await Appointment.findById(req.params.appointmentId);
  try {
    await client.bookAppointment(appointment);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/* Cancel booking */

router.delete('/:appointmentId/client', async function (req, res, next) {
  const client = await Client.findById(req.body.client);
  const appointment = await Appointment.findById(req.params.appointmentId);
  try {
    await client.cancelBooking(appointment);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/* Cancel appointment (expert) */

router.delete('/:appointmentId', async function (req, res, next) {
  const expert = await Expert.findById(req.body.expert);
  const appointment = await Appointment.findById(req.params.appointmentId);
  try {
    await expert.cancelAppointment(appointment);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

module.exports = router;
