const User = require('./user.js')
const Session = require('./session.js')

class Client extends User {
  constructor(name, email, phone) {
    super(name, email, phone)
    this._bookedSessions = [] // Array to store booked sessions
    this._cancelledSessions = [] // Array to store cancelled sessions
  }

  // Getters
  get bookedSessions() {
    return this._bookedSessions
  }

  get cancelledSessions() {
    return this._cancelledSessions
  }
  // Method to book a session
  bookSession(session) {
    // Check if session is already booked
    if (this._bookedSessions.find(s => s.id === session.id)) {
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

    this._bookedSessions.push(session)
    return session
  }

  // Method to cancel a booking
  cancelBooking(session) {
    const index = this._bookedSessions.findIndex(s => s.id === session.id)
    if (index === -1) {
      throw new Error('Session not found in booked sessions')
    }

    // Remove session from booked sessions
    const [cancelledSession] = this._bookedSessions.splice(index, 1)

    // Remove client from session
    const clientIndex = session.clients.findIndex(c => c === this)
    if (clientIndex !== -1) {
      session.clients.splice(clientIndex, 1)
    }

    // Update session status to cancelled
    cancelledSession.status = 'cancelled'

    // Add to cancelled sessions
    this._cancelledSessions.push(cancelledSession)

    // Notify expert to remove session from their schedule
    session.expert.cancelSession(session)

    return cancelledSession
  }

  // Method to get upcoming bookings
  getUpcomingBookings() {
    const now = new Date()
    return this._bookedSessions.filter(session => {
      return session.startTime > now && session.status !== 'cancelled'
    })
  }

  // Method to get session history (completed sessions)
  getSessionHistory() {
    return this._bookedSessions.filter(session => session.status === 'completed')
  }

  // Method to get cancelled sessions
  getCancelledSessions() {
    return this._cancelledSessions
  }

  // Method to get client info with bookings
  getClientInfo() {
    return {
      ...this.getUserInfo(),
      totalBookings: this._bookedSessions.length,
      upcomingBookings: this.getUpcomingBookings().length,
      completedSessions: this.getSessionHistory().length,
      cancelledSessions: this.getCancelledSessions().length,
    }
  }
}

module.exports = Client
