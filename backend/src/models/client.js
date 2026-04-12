const Appointment = require('./appointment.js')
const Review = require('./review.js')
const { ensureCompletedIfPast } = require('../utils/appointmentCompletion.js')
const { refIdString } = require('../utils/refs.js')
const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const passportLocalMongoose = require('passport-local-mongoose').default


const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
})
clientSchema.plugin(autopopulate)
clientSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

class Client {

  // Method to book an appointment
  async bookAppointment(appointment) {
    await ensureCompletedIfPast(appointment)
    if (appointment.availability === 'completed') {
      throw new Error('Appointment is not bookable.')
    }
    if (appointment.availability === "free") {
      appointment.client = this
      appointment.availability = "booked"
      await appointment.save()
    }
    else {
      throw new Error('Appointment is not bookable.')
    }
  }

  // Method to cancel a booking (only the client who booked may cancel)
  async cancelBooking(appointment) {
    await ensureCompletedIfPast(appointment)
    if (appointment.availability === 'completed') {
      throw new Error('Completed appointments cannot be cancelled.')
    }
    if (appointment.availability !== 'booked') {
      throw new Error('Appointment is not booked.')
    }
    const ref = appointment.client
    const bookedById = ref == null ? null : (ref._id != null ? ref._id : ref).toString()
    if (!bookedById || bookedById !== this._id.toString()) {
      throw new Error('You can only cancel your own booking.')
    }
    appointment.availability = 'free'
    appointment.client = undefined
    await appointment.save()
  }

  async getUpcomingAppointments() {
    const now = new Date()
    return Appointment.find({
      client: this._id,
      availability: 'booked',
      endTime: { $gte: now },
    })
      .sort({ startTime: 1 })
      .populate('expert', 'name email phone specialization hourlyRate')
  }

  async getCompletedAppointments() {
    const list = await Appointment.find({ client: this._id })
    await Promise.all(list.map((a) => ensureCompletedIfPast(a)))
    const now = new Date()
    return Appointment.find({
      client: this._id,
      $or: [{ availability: 'completed' }, { availability: 'booked', endTime: { $lt: now } }],
    })
      .sort({ startTime: -1 })
      .populate('expert', 'name email phone specialization hourlyRate')
  }

  async upsertReviewForAppointment(appointment, { rating, text }) {
    await ensureCompletedIfPast(appointment)
    if (!appointment) {
      throw new Error('Appointment is required')
    }
    if (appointment.availability !== 'completed') {
      throw new Error('You can only review completed appointments.')
    }
    const bookedById = refIdString(appointment.client)
    if (!bookedById || bookedById !== this._id.toString()) {
      throw new Error('You can only review your own appointments.')
    }
    const r = Number(rating)
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      throw new Error('Rating must be an integer from 1 to 5.')
    }
    const body = text == null ? '' : String(text)
    const expertId = refIdString(appointment.expert)
    if (!expertId) {
      throw new Error('Appointment has no expert.')
    }

    let review = await Review.findOne({ appointment: appointment._id })
    if (review) {
      review.rating = r
      review.text = body.slice(0, 8000)
      await review.save()
    } else {
      review = await Review.create({
        appointment: appointment._id,
        client: this._id,
        expert: expertId,
        rating: r,
        text: body.slice(0, 8000),
      })
    }
    return review
  }

  async updateProfile(updates) {
    const allowed = ['name', 'phone']
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(updates, key) && updates[key] !== undefined) {
        this[key] = updates[key]
      }
    }
    await this.save()
    return this
  }

  /** Public profile fields + id (no credentials). */
  toPublicInfo() {
    const o = this.toObject ? this.toObject() : { ...this }
    delete o.hash
    delete o.salt
    delete o.__v
    return o
  }
}

clientSchema.loadClass(Client)

module.exports = mongoose.model('Client', clientSchema)
