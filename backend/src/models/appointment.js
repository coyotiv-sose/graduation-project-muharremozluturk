const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const appointmentSchema = new mongoose.Schema({
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
appointmentSchema.plugin(autopopulate)

module.exports = mongoose.model('Appointment', appointmentSchema)
