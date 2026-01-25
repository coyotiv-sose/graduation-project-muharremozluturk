const User = require('./user.js')
const Session = require('./session.js')

class Client extends User {
  constructor(name, email, phone) {
    super(name, email, phone)
    this.bookedSessions = [] // Array to store booked sessions
    this.cancelledSessions = [] // Array to store cancelled sessions
  }

  // Method to book a session
  bookSession(session) {
    // Check if session is already booked
    if (this.bookedSessions.find(s => s.id === session.id)) {
      throw new Error('Session already booked by this client')
    }

    // Check if session is available for booking
    if (session.isFullyBooked()) {
      throw new Error('Session is not available for booking')
    }

    // Book session with expert first (this moves it from available to bookings)
    session.expert.bookSession(session)

    // Add client to session
    session.clients.push(this)

    // Update session status
    session.status = 'booked'

    this.bookedSessions.push(session)
    return session
  }

  // Method to cancel a booking
  cancelBooking(session) {
    const index = this.bookedSessions.findIndex(s => s.id === session.id)
    if (index === -1) {
      throw new Error('Session not found in booked sessions')
    }

    // Remove session from booked sessions
    const [cancelledSession] = this.bookedSessions.splice(index, 1)

    // Remove client from session
    const clientIndex = session.clients.findIndex(c => c === this)
    if (clientIndex !== -1) {
      session.clients.splice(clientIndex, 1)
    }

    // Update session status to cancelled
    cancelledSession.status = 'free'

    // Add to cancelled sessions
    this.cancelledSessions.push(cancelledSession)

    // Notify expert to remove session from their schedule
    session.expert.cancelBooking(session)

    return cancelledSession
  }

  // Method to get upcoming bookings
  getUpcomingBookings() {
    const now = new Date()
    return this.bookedSessions.filter(session => {
      return session.startTime > now && session.status !== 'cancelled'
    })
  }

  // Method to get session history (completed sessions)
  getSessionHistory() {
    return this.bookedSessions.filter(session => session.status === 'completed')
  }

  // Method to leave a review for a completed session
  leaveReview(session, rating, comment = null) {
    if (!this.bookedSessions.includes(session)) {
      throw new Error('You can only review sessions you have booked')
    }
    if(session.status !== 'completed') {
      throw new Error('You can only review completed sessions')
    }
    if(!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 10')
    }
    if(typeof comment !== 'string') {
      throw new Error('Comment must be a string')
    }
    return session.addReview(this, rating, comment)
  }

  // Method to get client info with bookings
  getClientInfo() {
    return {
      ...this.getUserInfo(),
      totalBookings: this.bookedSessions.length,
      upcomingBookings: this.getUpcomingBookings().length,
      completedSessions: this.getSessionHistory().length,
      cancelledSessions: this.cancelledSessions.length,
    }
  }
  get profile() {
    return `
      # Name: ${this.name}
      Email: ${this.email}
      ## Total Bookings: ${this.bookedSessions.length}
      Booking List:
      ${this.bookedSessions.map(session => session.summary).join('\n  ')}
      ## Cancelled Sessions: ${this.cancelledSessions.length}
      Cancelled Sessions List:
      ${this.cancelledSessions.map(session => session.summary).join('\n')}
    `
  }
}

module.exports = Client
