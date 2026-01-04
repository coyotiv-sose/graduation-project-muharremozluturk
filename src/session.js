class Session {
  constructor(id, expert, startTime, endTime, status = 'free', maxParticipants = 1) {
    if (!expert) {
      throw new Error('Session must have an expert')
    }
    this.id = id
    this.expert = expert
    this.startTime = new Date(startTime)
    this.endTime = new Date(endTime)
    this._status = status // 'booked', 'free', 'completed', 'cancelled'
    this.createdAt = new Date()
    this.maxParticipants = maxParticipants
    this.clients = [] // Array to store clients
  }
  get status() {
    return this._status
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
    return (this.endTime - this.startTime) / (1000 * 60)
  }

  // Method to check if session is active
  isFullyBooked() {
    return this.clients.length === this.maxParticipants
  }

  // Method to get session info
  getSessionInfo() {
    return {
      id: this.id,
      expert: this.expert.getUserInfo(),
      clients: this.clients.map(client => client.getUserInfo()),
      maxParticipants: this.maxParticipants,
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      duration: this.getDuration(),
      isFullyBooked: this.isFullyBooked(),
      createdAt: this.createdAt,
    }
  }
}

module.exports = Session
