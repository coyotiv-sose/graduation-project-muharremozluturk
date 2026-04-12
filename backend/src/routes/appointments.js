var express = require('express');
var router = express.Router();
const Appointment = require('../models/appointment.js');
const Expert = require('../models/expert.js')
const mongoose = require('mongoose');
const { sanitizeAppointmentForRequest } = require('../utils/appointmentResponse.js');
const { ensureCompletedIfPast } = require('../utils/appointmentCompletion.js');
const { roleOfUser } = require('./accounts.js');

/* GET appointment listing. */
router.get('/', async function (req, res, next) {
  try {
    const appointments = await Appointment.find();
    const synced = await Promise.all(appointments.map((a) => ensureCompletedIfPast(a)));
    res.send(synced.map((a) => sanitizeAppointmentForRequest(a, req)));
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

    await ensureCompletedIfPast(appointment);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (err) {
    next(err);
  }
});

/* Create free appointment slot (session expert only; always for the logged-in expert) */
router.post('/', async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Login required' });
  }
  if (roleOfUser(req.user) !== 'expert') {
    return res.status(403).json({ error: 'Only experts can create appointment slots' });
  }
  const startTime = new Date(req.body.startTime);
  const endTime = new Date(req.body.endTime);
  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return res.status(400).json({ error: 'Invalid startTime or endTime' });
  }
  if (startTime.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Start time cannot be in the past' });
  }
  try {
    const appointment = await req.user.createAppointment(startTime, endTime, 'free');
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (err) {
    next(err);
  }
});

/* Book appointment (session client only; body.client is ignored) */

router.post('/:appointmentId/client', async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Login required' });
  }
  if (roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can book appointments' });
  }
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json('Appointment not found');
    }
    await req.user.bookAppointment(appointment);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/* Cancel booking (session client only; must own the booking) */

router.delete('/:appointmentId/client', async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Login required' });
  }
  if (roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can cancel bookings' });
  }
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);
    if (!appointment) {
      return res.status(404).json('Appointment not found');
    }
    await req.user.cancelBooking(appointment);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

/* Cancel appointment (expert) */

router.put('/:appointmentId', async function (req, res, next) {
  const { appointmentId } = req.params;
  const { expert: expertId, newAppointmentId } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(appointmentId) ||
    !mongoose.Types.ObjectId.isValid(expertId) ||
    !mongoose.Types.ObjectId.isValid(newAppointmentId)
  ) {
    return res.status(404).json('Appointment not found');
  }

  try {
    const [expert, appointment, newAppointment] = await Promise.all([
      Expert.findById(expertId),
      Appointment.findById(appointmentId),
      Appointment.findById(newAppointmentId),
    ]);

    if (!expert) {
      return res.status(404).json('Expert not found');
    }

    if (!appointment || !newAppointment) {
      return res.status(404).json('Appointment not found');
    }

    const rescheduledAppointment = await expert.rescheduleAppointment(appointment, newAppointment);
    res.send(sanitizeAppointmentForRequest(rescheduledAppointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

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
