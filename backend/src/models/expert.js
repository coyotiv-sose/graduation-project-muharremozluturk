const Appointment = require('./appointment.js')
const { ensureCompletedIfPast } = require('../utils/appointmentCompletion.js')
const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const passportLocalMongoose = require('passport-local-mongoose').default

const expertSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  specialization: String,
  hourlyRate: Number,
  appointments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      autopopulate: false,
    },
  ],
})

expertSchema.plugin(autopopulate)
expertSchema.plugin(passportLocalMongoose, { usernameField: 'email' })

function refIdString(ref) {
  if (ref == null) return null
  return (ref._id != null ? ref._id : ref).toString()
}

class Expert {

  // Method to add available time slot
  async createAppointment(startTime, endTime, availability = 'free') {

    if (startTime >= endTime) {
      throw new Error('End time must be after start time')
    }

    //TODO: Check for conflicts with existing appointments (both free and booked, excluding cancelled)
    const appointment = await Appointment.create({
      expert: this._id,
      startTime,
      endTime,
      availability
    })
    this.appointments.push(appointment._id)
    await this.save()
    return appointment
  }

  // Method to remove available time slot
  async cancelAppointment(appointment) {
    await ensureCompletedIfPast(appointment)
    if (appointment.availability === 'completed') {
      throw new Error('Completed appointments cannot be cancelled.')
    }
    if (appointment.availability !== 'cancelled') {
      appointment.availability = 'cancelled'
      appointment.client = undefined
      this.appointments.pull(appointment._id)
      await this.save()
      await appointment.save()
    }
    else {
      throw new Error('Appointment is cancelled')
    }
  }

  async rescheduleAppointment(currentAppointment, newAppointment) {
    if (!currentAppointment || !newAppointment) {
      throw new Error('Both current and new appointments are required')
    }

    await ensureCompletedIfPast(currentAppointment)
    await ensureCompletedIfPast(newAppointment)

    if (currentAppointment._id.toString() === newAppointment._id.toString()) {
      throw new Error('Choose a different appointment to reschedule')
    }

    if (refIdString(currentAppointment.expert) !== this._id.toString()) {
      throw new Error('Current appointment does not belong to this expert')
    }

    if (refIdString(newAppointment.expert) !== this._id.toString()) {
      throw new Error('New appointment does not belong to this expert')
    }

    if (currentAppointment.availability !== 'booked') {
      throw new Error('Only booked appointments can be rescheduled')
    }

    if (newAppointment.availability !== 'free') {
      throw new Error('New appointment must be free')
    }

    newAppointment.client = currentAppointment.client
    newAppointment.availability = 'booked'

    currentAppointment.client = undefined
    currentAppointment.availability = 'free'

    await Promise.all([currentAppointment.save(), newAppointment.save()])
    return newAppointment
  }

  /*TODO:
  add appointment notes
  profile
  update hourly rate
  get expert info*/
}

expertSchema.loadClass(Expert)

module.exports = mongoose.model('Expert', expertSchema)
