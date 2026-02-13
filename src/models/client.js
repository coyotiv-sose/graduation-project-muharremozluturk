const Session = require('./session.js')
const CryptoJS = require('crypto-js')
const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const clientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
})
clientSchema.plugin(autopopulate)

class Client {

  // Method to book a session
  async bookSession(session) {
    if (session.availability === "free") {
      session.client = this
      session.availability = "booked"
      await session.save()
    }
    else {
      throw new Error('Session is not bookable.')
    }
  }

  // Method to cancel a booking
  async cancelBooking(session) {
    if (session.availability === 'booked') {
      session.availability = "free"
      session.client = undefined
      await session.save()
    }
    else {
      throw new Error('Session is not booked.')
    }
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
