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
  async createSession(startTime, endTime, availability = 'free') {

    if (startTime >= endTime) {
      throw new Error('End time must be after start time')
    }

    //TODO: Check for conflicts with existing sessions (both free and booked, excluding cancelled)
    const session = await Session.create({
      expert: this._id,
      startTime,
      endTime,
      availability
    })
    this.sessions.push(session._id)
    await this.save()
    return session
  }

  // Method to remove available time slot
  async cancelSession(session) {
    if (session.availability !== 'cancelled') {
      session.availability = 'cancelled'
      session.client = undefined
      this.sessions.pull(session._id)
      await this.save()
      await session.save()
    }
    else {
      throw new Error('Session is cancelled')
    }
  }

  /*TODO:
  Reschedule a session 
  complete Session
  add session notes
  profile
  update hourly rate
  get expert info*/
}

expertSchema.loadClass(Expert)

module.exports = mongoose.model('Expert', expertSchema)
