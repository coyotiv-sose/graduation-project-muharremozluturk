var express = require('express');
var router = express.Router();
const Appointment = require('../models/appointment.js');
const Expert = require('../models/expert.js')
const Review = require('../models/review.js')
const mongoose = require('mongoose');
const { sanitizeAppointmentForRequest } = require('../utils/appointmentResponse.js');
const { ensureCompletedIfPast } = require('../utils/appointmentCompletion.js');
const { roleOfUser } = require('./accounts.js');
const { refIdString } = require('../utils/refs.js');

function reviewToJson(review) {
  if (!review) return null
  const o = review.toObject ? review.toObject() : { ...review }
  return {
    _id: o._id,
    appointment: o.appointment,
    rating: o.rating,
    text: o.text,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}

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

router.post('/:appointmentId/review', async function (req, res, next) {
  if (!req.user || roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can submit reviews' });
  }
  const { appointmentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(404).json('Appointment not found');
  }
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json('Appointment not found');
    const review = await req.user.upsertReviewForAppointment(appointment, {
      rating: req.body.rating,
      text: req.body.text,
    });
    res.status(201).send(reviewToJson(review));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.put('/:appointmentId/review', async function (req, res, next) {
  if (!req.user || roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can update reviews' });
  }
  const { appointmentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(404).json('Appointment not found');
  }
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json('Appointment not found');
    const review = await req.user.upsertReviewForAppointment(appointment, {
      rating: req.body.rating,
      text: req.body.text,
    });
    res.send(reviewToJson(review));
  } catch (error) {
    return res.status(400).json(error.message);
  }
});

router.get('/:appointmentId/review', async function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Login required' });
  }
  const { appointmentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(404).json('Appointment not found');
  }
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json('Appointment not found');
    await ensureCompletedIfPast(appointment);
    const review = await Review.findOne({ appointment: appointment._id });
    if (!review) {
      return res.status(404).json('Review not found');
    }
    const user = req.user;
    const viewerRole = roleOfUser(user);
    const clientId = refIdString(appointment.client);
    const expertId = refIdString(appointment.expert);
    const viewerId = String(user._id);
    const canSee =
      (viewerRole === 'client' && clientId && clientId === viewerId) ||
      (viewerRole === 'expert' && expertId && expertId === viewerId);
    if (!canSee) {
      return res.status(403).json({ error: 'You cannot view this review' });
    }
    res.send(reviewToJson(review));
  } catch (err) {
    next(err);
  }
});

router.put('/:appointmentId/notes', async function (req, res, next) {
  if (!req.user || roleOfUser(req.user) !== 'expert') {
    return res.status(403).json({ error: 'Only experts can add appointment notes' });
  }
  const { appointmentId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return res.status(404).json('Appointment not found');
  }
  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) return res.status(404).json('Appointment not found');
    await req.user.setAppointmentNotes(appointment, req.body.notes);
    res.send(sanitizeAppointmentForRequest(appointment, req));
  } catch (error) {
    return res.status(400).json(error.message);
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
