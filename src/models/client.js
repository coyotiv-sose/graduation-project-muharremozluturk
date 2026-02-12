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

class Client  {
  
  // Method to book a session
  bookSession(session) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    // Check if client already booked this session
    if (session.clients.includes(this)) {
      throw new Error('Session already booked by this client')
    }

    // Check if session is available for booking
    if (session.status !== 'free') {
      throw new Error('Session is not available for booking')
    }

    // Book session with expert (marks it as booked on expert side)
    session.expert.bookSession(session, this)

    return session
  }

  // Method to cancel a booking
  cancelBooking(session) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    if (!session.clients.includes(this)) {
      throw new Error('Session not found in client bookings')
    }

    // Remove client from session
    const clientIndex = session.clients.findIndex(c => c === this)
    if (clientIndex !== -1) {
      session.clients.splice(clientIndex, 1)
    }

    // If no clients remain, notify expert to free the session
    if (session.clients.length === 0) {
      session.expert.cancelBooking(session)
    }

    return session
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
    if(session.status !== 'completed') {
      throw new Error('You can only review completed sessions')
    }
    if(!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5')
    }
    if(typeof comment !== 'string') {
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
