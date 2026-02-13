const format = require('date-format')
const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const sessionSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  availability: String,
  client:
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      autopopulate: {
        maxDepth: 0,
      },
    },
  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expert',
    autopopulate: {
      maxDepth: 0,
    },
  },
})

class Session {

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

  // Method to check if session should be automatically completed
  checkCompletionStatus() {
    const now = new Date()
    // Auto-complete if endTime has passed and session is still booked
    if (this.status === 'booked' && now >= this.endTime) {
      this.markAsCompleted()
      return true
    }
    return false
  }

  // Method to mark session as completed
  markAsCompleted() {
    if (this.status === 'cancelled') {
      throw new Error('Cannot complete a cancelled session')
    }
    if (this.status === 'completed') {
      throw new Error('Session is already completed')
    }
    if (this.status === 'free') {
      throw new Error('Cannot complete a free (unbooked) session')
    }
    
    this.status = 'completed'
  }

  // Method to add expert notes
  addExpertNotes(notes) {
    if (typeof notes !== 'string' || notes.trim().length === 0) {
      throw new Error('Notes must be a non-empty string')
    }
    this.expertNotes = notes.trim()
  }

  // Method to add a review from a client
  addReview(client, rating, comment) {
    if (!this.clients.includes(client)) {
      throw new Error('Only clients who attended this session can leave a review')
    }
    
    if (this.status !== 'completed') {
      throw new Error('Reviews can only be added for completed sessions')
    }

    // Check if client already reviewed
    const existingReview = this.reviews.find(r => r.client === client)
    if (existingReview) {
      throw new Error('Client has already reviewed this session')
    }

    // Validate rating (1-5 stars)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5')
    }

    const review = {
      client: client,
      clientName: client.name,
      rating: rating,
      comment: comment ? comment.trim() : null,
      reviewedAt: new Date(),
    }

    this.reviews.push(review)
    return review
  }

  // Method to get average rating
  getAverageRating() {
    if (this.reviews.length === 0) {
      return null
    }
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / this.reviews.length).toFixed(2)
  }

  // Method to get session info
  getSessionInfo() {
    return {
      id: this.id,
      expert: this.expert.getUserInfo(),
      clients: this.clients.map(client => client.getUserInfo()),
      startTime: this.startTime,
      endTime: this.endTime,
      status: this.status,
      duration: this.getDuration(),
      createdAt: this.createdAt,
      expertNotes: this.expertNotes,
      reviews: this.reviews.map(review => ({
        clientName: review.clientName,
        rating: review.rating,
        comment: review.comment,
        reviewedAt: review.reviewedAt,
      })),
      averageRating: this.getAverageRating(),
    }
  }

  // get summary() {
  //   console.log()
  //   return `-Session ${this.id} with Expert ${this.expert.name} from ${format.asString(
  //     'dd.MM.yyyy hh:mm',
  //     this.startTime
  //   )} to ${format.asString('dd.MM.yyyy hh:mm', this.endTime)} (Status: ${this.status}, Clients: ${
  //     this.clients.length
  //   })`
  // }

  static getSession(id) {
    return this.list.find(session => session.id === id);
  }
}

sessionSchema.loadClass(Session)
module.exports = mongoose.model('Session', sessionSchema)
