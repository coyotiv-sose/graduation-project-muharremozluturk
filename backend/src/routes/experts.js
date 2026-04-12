var express = require('express')
var router = express.Router()
var Expert = require('../models/expert.js')
var Review = require('../models/review.js')
var mongoose = require('mongoose')
const { roleOfUser } = require('./accounts.js')

async function expertWithReviewStats(expert) {
  const id = expert._id
  const stats = await Review.aggregate([
    { $match: { expert: id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ])
  const base = expert.toPublicProfile()
  if (stats.length === 0) {
    base.averageRating = null
    base.reviewCount = 0
  } else {
    base.averageRating = Math.round(stats[0].averageRating * 100) / 100
    base.reviewCount = stats[0].reviewCount
  }
  return base
}

router.get('/', async function (req, res, next) {
  try {
    const experts = await Expert.find()
    const out = await Promise.all(experts.map((e) => expertWithReviewStats(e)))
    res.send(out)
  } catch (err) {
    next(err)
  }
})

router.post('/', async function (req, res, next) {
  const { name, email, phone, specialization, hourlyRate, password } = req.body
  const expert = await Expert.register({ name, email, phone, specialization, hourlyRate }, password)
  res.send(await expertWithReviewStats(expert))
})

router.patch('/:id', async function (req, res, next) {
  const { id } = req.params
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Expert not found')
  }
  if (!req.user || roleOfUser(req.user) !== 'expert') {
    return res.status(403).json({ error: 'Only experts can update their profile' })
  }
  if (req.user._id.toString() !== id) {
    return res.status(403).json({ error: 'You can only update your own profile' })
  }
  try {
    if (req.body.hourlyRate !== undefined) {
      await req.user.updateHourlyRate(req.body.hourlyRate)
    }
    await req.user.updateProfile(req.body)
    const fresh = await Expert.findById(id)
    res.send(await expertWithReviewStats(fresh))
  } catch (err) {
    res.status(400).json(err.message || 'Could not update profile')
  }
})

router.get('/:id', async function (req, res, next) {
  const { id } = req.params

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json('Expert not found')
  }

  const expert = await Expert.findById(id)

  if (!expert) return res.status(404).json('Expert not found')

  try {
    res.send(await expertWithReviewStats(expert))
  } catch (err) {
    next(err)
  }
})

module.exports = router
