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
  // Method to get session duration in minutes
  getDuration() {
    return (this.endTime - this.startTime) / (1000 * 60)
  }
}

sessionSchema.loadClass(Session)
module.exports = mongoose.model('Session', sessionSchema)
