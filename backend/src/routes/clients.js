var express = require('express')
var router = express.Router()
const Client = require('../models/client.js')
const Review = require('../models/review.js')
const mongoose = require('mongoose')
const { roleOfUser } = require('./accounts.js')

function attachReviewsToAppointments(appointments) {
  return Review.find({ appointment: { $in: appointments.map((a) => a._id) } }).then((reviews) => {
    const byAppt = new Map(reviews.map((r) => [String(r.appointment), r]))
    return appointments.map((a) => {
      const o = a.toObject ? a.toObject() : { ...a }
      const rev = byAppt.get(String(a._id))
      if (rev) {
        o.review = {
          _id: rev._id,
          rating: rev.rating,
          text: rev.text,
          createdAt: rev.createdAt,
          updatedAt: rev.updatedAt,
        }
      }
      return o
    })
  })
}

router.get('/', async function (req, res, next) {
  try {
    const list = await Client.find()
    res.send(list.map((c) => (c.toPublicInfo ? c.toPublicInfo() : c)))
  } catch (err) {
    next(err)
  }
})

router.post('/', async function (req, res, next) {
  const { name, email, phone, password } = req.body
  const client = await Client.register({ name, email, phone }, password)
  res.send(client.toPublicInfo ? client.toPublicInfo() : client)
})

router.get('/:id/upcoming-appointments', async function (req, res, next) {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Client not found')
  }
  if (!req.user || roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can list their bookings' })
  }
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: 'You can only view your own bookings' })
  }
  try {
    const client = await Client.findById(id)
    if (!client) return res.status(404).json('Client not found')
    const appointments = await client.getUpcomingAppointments()
    res.send(appointments.map((a) => (a.toObject ? a.toObject() : a)))
  } catch (err) {
    next(err)
  }
})

router.get('/:id/completed-appointments', async function (req, res, next) {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Client not found')
  }
  if (!req.user || roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can list their bookings' })
  }
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: 'You can only view your own bookings' })
  }
  try {
    const client = await Client.findById(id)
    if (!client) return res.status(404).json('Client not found')
    const appointments = await client.getCompletedAppointments()
    const withReviews = await attachReviewsToAppointments(appointments)
    res.send(withReviews)
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async function (req, res, next) {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Client not found')
  }
  if (!req.user || roleOfUser(req.user) !== 'client') {
    return res.status(403).json({ error: 'Only clients can update their profile' })
  }
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: 'You can only update your own profile' })
  }
  try {
    await req.user.updateProfile(req.body)
    res.send(req.user.toPublicInfo())
  } catch (err) {
    res.status(400).json(err.message || 'Could not update profile')
  }
})

router.get('/:id', async function (req, res, next) {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Client not found')
  }

  const client = await Client.findById(id)

  if (!client) return res.status(404).json('Client not found')

  res.send(client.toPublicInfo())
})

module.exports = router
