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

  // Method to get upcoming bookings
  getUpcomingBookings() {
    const now = new Date()
    return Session.list.filter(session => {
      return session.clients.includes(this) && session.startTime > now && session.status !== 'cancelled'
    })
  }

  // Method to get session history (completed sessions)
  getSessionHistory() {
    return Session.list.filter(session => {
      return session.clients.includes(this) && session.status === 'completed'
    })
  }

  // Method to leave a review for a completed session
  leaveReview(session, rating, comment = null) {
    if (!session.clients.includes(this)) {
      throw new Error('You can only review sessions you have booked')
    }
    if (session.status !== 'completed') {
      throw new Error('You can only review completed sessions')
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5')
    }
    if (typeof comment !== 'string') {
      throw new Error('Comment must be a string')
    }
    return session.addReview(this, rating, comment)
  }

  // Method to get client info with bookings
  getClientInfo() {
    const totalBookings = Session.list.filter(session => session.clients.includes(this)).length
    const upcomingBookings = this.getUpcomingBookings().length
    const completedSessions = this.getSessionHistory().length

    return {
      ...this.getUserInfo(),
      totalBookings,
      upcomingBookings,
      completedSessions,
    }
  }
  get profile() {
    const bookings = Session.list.filter(session => session.clients.includes(this))
    return `
      # Name: ${this.name}
      Email: ${this.email}
      ## Total Bookings: ${bookings.length}
      Booking List:
      ${bookings.map(session => session.summary).join('\n  ')}
    `
  }
}

clientSchema.loadClass(Client)

module.exports = mongoose.model('Client', clientSchema)
