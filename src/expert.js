const User = require('./user.js')
const Session = require('./session.js')

class Expert extends User {
  constructor(name, email, phone, specialization, hourlyRate) {
    super(name, email, phone)
    this._specialization = specialization
    this._hourlyRate = hourlyRate
    this._availableSessios = []
    this._bookings = []
  }

  // Getters
  get specialization() {
    return this._specialization
  }

  get hourlyRate() {
    return this._hourlyRate
  }

  get availableSessions() {
    return this._availableSessios
  }

  get bookings() {
    return this._bookings
  }

  // Setters
  set specialization(value) {
    this._specialization = value
  }

  set hourlyRate(value) {
    if (value >= 0) {
      this._hourlyRate = value
    } else {
      throw new Error('Hourly rate must be non-negative')
    }
  }

  // Method to add available time slot
  createSession(startTime, endTime, status = 'free', maxParticipants = 1) {
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      throw new Error('End time must be after start time')
    }

    // Check for conflicts with existing available times
    const hasConflict = this._availableSessios.some(slot => {
      return start < slot._endTime && start > slot._startTime && end > slot._startTime && end < slot._endTime
    })

    if (hasConflict) {
      throw new Error('Time slot conflicts with existing available time')
    }

    const newSession = new Session(
      Math.floor(Math.random() * 10000000),
      this,
      startTime,
      endTime,
      status,
      maxParticipants
    )

    this._availableSessios.push(newSession)
    return newSession
  }

  // Method to remove available time slot
  cancelSession(session) {
    this._availableSessios = this._availableSessios.filter(slot => slot.id !== session.id)
    this._bookings = this._bookings.filter(booking => booking.id !== session.id)
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
    const alreadyBooked = this._bookings.find(s => s.id === session.id)

    // If not already booked, check if it's in available sessions
    if (!alreadyBooked) {
      const foundSession = this._availableSessios.find(s => s.id === session.id)
      if (foundSession === undefined) {
        throw new Error('Session is not available for booking')
      }
      // Move from available to bookings on first booking
      this._availableSessios = this._availableSessios.filter(s => s.id !== session.id)
      this._bookings.push(session)
    }
    // If already booked, just allow the booking (for group sessions with multiple clients)
  }

  // Method to get expert info with sessions
  getExpertInfo() {
    return {
      ...this.getUserInfo(),
      specialization: this._specialization,
      hourlyRate: this._hourlyRate,
      totalSessions: this._availableSessios.length + this._bookings.length,
    }
  }
}

module.exports = Expert
