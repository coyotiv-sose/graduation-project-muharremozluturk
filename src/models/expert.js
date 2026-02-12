const Session = require('./session.js')
const Client = require('./client.js')
const currency = require('currency.js')
const CryptoJS = require('crypto-js')
const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const expertSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  specialization: String,
  hourlyRate: Number,
  sessions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      autopopulate: {
        maxDepth: 1,
      },
    },
  ],
})
class Expert {
  
  // Method to add available time slot
  createSession(startTime, endTime, status = 'free') {
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      throw new Error('End time must be after start time')
    }

    // Check for conflicts with existing sessions (both free and booked, excluding cancelled)
    const hasConflict = this.sessions.some(slot => {
      if (slot.status === 'cancelled') return false
      // Two time ranges overlap if: newStart < existingEnd AND newEnd > existingStart
      return start < slot.endTime && end > slot.startTime
    })

    if (hasConflict) {
      throw new Error('Time slot conflicts with existing available time')
    }

    const newSession = Session.create({
      id: CryptoJS.SHA256(startTime + endTime + status).toString().substring(0, 10),
      expert: this,
      startTime,
      endTime,
      status
    })

    this.sessions.push(newSession)
    return newSession
  }

  // Method to remove available time slot
  cancelSession(session) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    if (!this.sessions.includes(session)) {
      throw new Error('Session not found in expert sessions')
    }

    session.status = 'cancelled'
    session.clients = []
  }

  bookSession(session, client) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    if (!(client instanceof Client)) {
      throw new Error('Invalid Client')
    }

    // Check if session's expert is this expert
    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    if (!this.sessions.includes(session)) {
      throw new Error('Session not found in expert sessions')
    }

    if (session.status !== 'free') {
      throw new Error('Session is not available for booking')
    }

    // Mark session as booked; clients are managed by Client.bookSession
    session.status = 'booked'
    session.clients.push(client)
  }

  cancelBooking(session) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    if (!this.sessions.includes(session)) {
      throw new Error('Session not found in expert sessions')
    }

    // Remove all clients from the session and mark it as free again
    session.clients = []
    session.status = 'free'
  }

  // Method to reschedule a session
  rescheduleSession(session, newStartTime, newEndTime) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    // Check if session's expert is this expert
    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    // Validate new time
    const newStart = new Date(newStartTime)
    const newEnd = new Date(newEndTime)

    if (newEnd <= newStart) {
      throw new Error('End time must be after start time')
    }

    // Check if session exists in expert's sessions
    if (!this.sessions.includes(session)) {
      throw new Error('Session not found in expert sessions')
    }

    // Check for conflicts with other sessions (excluding the current session being rescheduled)
    const hasConflict = this.sessions.some(slot => {
      if (slot.id === session.id) return false // Exclude current session
      if (slot.status === 'cancelled') return false
      // Two time ranges overlap if: newStart < existingEnd AND newEnd > existingStart
      return newStart < slot.endTime && newEnd > slot.startTime
    })

    if (hasConflict) {
      throw new Error('New time slot conflicts with existing session')
    }

    // Update session times
    session.startTime = newStart
    session.endTime = newEnd

    return session
  }

  // Method to mark a session as completed
  completeSession(session) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    session.markAsCompleted()
    return session
  }

  // Method to add notes to a session
  addSessionNotes(session, notes) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    session.addExpertNotes(notes)
    return session
  }

  // Method to check and auto-complete all sessions that have passed their end time
  checkAndCompleteSessions() {
    const completedSessions = []

    // Check sessions
    this.sessions.forEach(session => {
      if (session.checkCompletionStatus()) {
        completedSessions.push(session)
      }
    })

    return completedSessions
  }

  // Method to get completed sessions
  getCompletedSessions() {
    return this.sessions.filter(session => session.status === 'completed')
  }

  // Method to get average rating across all completed sessions
  getAverageRating() {
    const completedSessions = this.getCompletedSessions()
    if (completedSessions.length === 0) {
      return null
    }

    const allRatings = []
    completedSessions.forEach(session => {
      session.reviews.forEach(review => {
        allRatings.push(review.rating)
      })
    })

    if (allRatings.length === 0) {
      return null
    }

    const sum = allRatings.reduce((acc, rating) => acc + rating, 0)
    return (sum / allRatings.length).toFixed(2)
  }

  // Method to get expert info with sessions
  getExpertInfo() {
    return {
      ...this.getUserInfo(),
      specialization: this.specialization,
      hourlyRate: this.hourlyRate,
      totalSessions: this.sessions.length,
      completedSessions: this.getCompletedSessions().length,
      averageRating: this.getAverageRating(),
    }
  }

  get profile() {
    return `
    # Expert: ${this.name}
    Mail: ${this.email} | Phone: ${this.phone}
    Specialization: (${this.specialization}) - Rate: ${currency(this.hourlyRate).format()}/hr
    # Available Sessions: ${this.sessions.filter(session => session.status === 'free').length}
    ${this.sessions.filter(session => session.status === 'free').map(session => session.summary).join('\n    ')}
    # Completed Sessions: ${this.getCompletedSessions().length}
    `
  }
  
}

expertSchema.loadClass(Expert)

module.exports = mongoose.model('Expert', expertSchema)
