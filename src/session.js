class Session {
  constructor(id, expert, startTime, endTime, status = 'free', maxParticipants = 1) {
    if (!expert) {
      throw new Error('Session must have an expert')
    }
    this._id = id
    this._expert = expert
    this._startTime = new Date(startTime)
    this._endTime = new Date(endTime)
    this._status = status // 'booked', 'free', 'completed', 'cancelled'
    this._createdAt = new Date()
    this._maxParticipants = maxParticipants
    this._clients = [] // Array to store clients
  }

  // Getters
  get id() {
    return this._id
  }

  get expert() {
    return this._expert
  }

  get startTime() {
    return this._startTime
  }

  get endTime() {
    return this._endTime
  }

  get status() {
    return this._status
  }

  get createdAt() {
    return this._createdAt
  }
  get maxParticipants() {
    return this._maxParticipants
  }

  get clients() {
    return this._clients
  }

  // Setters
  set id(value) {
    this._id = value
  }

  set expert(value) {
    if (!value) {
      throw new Error('Session must have an expert')
    }
    this._expert = value
  }

  set startTime(value) {
    this._startTime = new Date(value)
  }

  set endTime(value) {
    this._endTime = new Date(value)
  }

  set status(value) {
    const validStatuses = ['booked', 'free', 'completed', 'cancelled']
    if (validStatuses.includes(value)) {
      this._status = value
    } else {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }
  }

  // Method to get session duration in minutes
  getDuration() {
    return (this._endTime - this._startTime) / (1000 * 60)
  }

  // Method to check if session is active
  isFullyBooked() {
    return this._clients.length === this._maxParticipants
  }

  // Method to get session info
  getSessionInfo() {
    return {
      id: this._id,
      expert: this._expert.getUserInfo(),
      startTime: this._startTime,
      endTime: this._endTime,
      status: this._status,
      duration: this.getDuration(),
      isFullyBooked: this.isFullyBooked(),
      createdAt: this._createdAt,
    }
  }
}

module.exports = Session
