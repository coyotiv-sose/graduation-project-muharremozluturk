const User = require('./user.js')
const Session = require('./session.js')
const currency = require('currency.js')

class Expert extends User {
  constructor(name, email, phone, specialization, hourlyRate) {
    super(name, email, phone)
    this.specialization = specialization
    this.hourlyRate = hourlyRate
    this.availableSessions = []
    this.bookings = []
  }

  // Method to add available time slot
  createSession(startTime, endTime, status = 'free', maxParticipants = 1) {
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      throw new Error('End time must be after start time')
    }

    // Check for conflicts with existing available times
    const hasConflict = this.availableSessions.some(slot => {
      return start < slot.endTime && start > slot.startTime && end > slot.startTime && end < slot.endTime
    })

    if (hasConflict) {
      throw new Error('Time slot conflicts with existing available time')
    }

    const newSession = new Session(
      Math.floor(Math.random() * 10000000) + 1000000,
      this,
      startTime,
      endTime,
      status,
      maxParticipants
    )

    this.availableSessions.push(newSession)
    return newSession
  }

  // Method to remove available time slot
  cancelSession(session) {
    this.availableSessions = this.availableSessions.filter(slot => slot.id !== session.id)
    this.bookings = this.bookings.filter(booking => booking.id !== session.id)
    session.status = 'cancelled'
    session.clients.forEach(client => {
      const index = client.bookedSessions.findIndex(s => s.id === session.id)
      if (index !== -1) {
        client.bookedSessions.splice(index, 1)
      }
      client.cancelledSessions.push(session)
    })
    session.clients = []
  }

  bookSession(session) {
    if (!(session instanceof Session)) {
      throw new Error('Invalid session')
    }

    // Check if session's expert is this expert
    if (session.expert !== this) {
      throw new Error('Session does not belong to this expert')
    }

    // Check if session is already booked (in bookings array)
    const alreadyBooked = this.bookings.find(s => s.id === session.id)

    // If not already booked, check if it's in available sessions
    if (!alreadyBooked) {
      const foundSession = this.availableSessions.find(s => s.id === session.id)
      if (foundSession === undefined) {
        throw new Error('Session is not available for booking')
      }
      // Move from available to bookings on first booking
      this.availableSessions = this.availableSessions.filter(s => s.id !== session.id)
      this.bookings.push(session)
    }
    // If already booked, just allow the booking (for group sessions with multiple clients)
  }

  cancelBooking(session) {
    this.bookings = this.bookings.filter(booking => booking.id !== session.id)
    session.status = 'free'
    session.clients.forEach(client => {
      const index = client.bookedSessions.findIndex(s => s.id === session.id)
      if (index !== -1) {
        client.bookedSessions.splice(index, 1)
      }
      client.cancelledSessions.push(session)
    })
    session.clients = []
    this.availableSessions.push(session)
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

    // Check if session exists in expert's sessions (either booked or available)
    const isBooked = session.status === 'booked';
    const isAvailable = this.availableSessions.find(s => s.id === session.id)

    if (!isBooked && !isAvailable) {
      throw new Error('Session not found in expert sessions')
    }

    // Check for conflicts with other sessions (excluding the current session being rescheduled)
    // Check conflicts with available sessions
    const hasConflictWithAvailable = this.availableSessions.some(slot => {
      if (slot.id === session.id) return false // Exclude current session
      // Two time ranges overlap if: newStart < existingEnd AND newEnd > existingStart
      return newStart < slot.endTime && newEnd > slot.startTime
    })

    if (hasConflictWithAvailable) {
      throw new Error('New time slot conflicts with existing available session')
    }

    // Check conflicts with booked sessions
    const hasConflictWithBooked = this.bookings.some(booking => {
      if (booking.id === session.id) return false // Exclude current session
      // Two time ranges overlap if: newStart < existingEnd AND newEnd > existingStart
      return newStart < booking.endTime && newEnd > booking.startTime
    })

    if (hasConflictWithBooked) {
      throw new Error('New time slot conflicts with existing booked session')
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
    
    // Check booked sessions
    this.bookings.forEach(session => {
      if (session.checkCompletionStatus()) {
        completedSessions.push(session)
      }
    })

    return completedSessions
  }

  // Method to get completed sessions
  getCompletedSessions() {
    return this.bookings.filter(session => session.status === 'completed')
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
      totalSessions: this.availableSessions.length + this.bookings.length,
      completedSessions: this.getCompletedSessions().length,
      averageRating: this.getAverageRating(),
    }
  }

  get profile() {
    return `
    # Expert: ${this.name}
    Mail: ${this.email} | Phone: ${this.phone}
    Specialization: (${this.specialization}) - Rate: ${currency(this.hourlyRate).format()}/hr
    # Available Sessions: ${this.availableSessions.length}
    ${this.availableSessions.map(session => session.summary).join('\n    ')}
    # Completed Sessions: ${this.getCompletedSessions().length}
    `
  }

  static createExpert(name, email, phone, specialization, hourlyRate) {
    const expert = new Expert(name, email, phone, specialization, hourlyRate)
    this.list.push(expert)  // add to list
    return expert
  }
  static list = []
}

module.exports = Expert
