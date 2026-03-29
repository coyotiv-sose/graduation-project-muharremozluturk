const Appointment = require('./appointment.js')
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

  /*TODO:
  get upcoming bookings
  get completed bookings
  leave a review and rating
  update review and rating
  get client info
  */

}

clientSchema.loadClass(Client)

module.exports = mongoose.model('Client', clientSchema)
