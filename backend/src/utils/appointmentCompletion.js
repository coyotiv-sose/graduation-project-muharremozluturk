/**
 * Past appointments with availability `free` or `booked` are persisted as `completed`
 * so they stay non-bookable and non-cancellable. `cancelled` is left unchanged.
 */

function getAppointmentEndTime(appointment) {
  if (!appointment) return null
  const end = appointment.endTime
  if (end != null && !Number.isNaN(new Date(end).getTime())) {
    return new Date(end)
  }
  const start = appointment.startTime
  if (start != null && !Number.isNaN(new Date(start).getTime())) {
    return new Date(start)
  }
  return null
}

function isAppointmentPast(appointment) {
  const end = getAppointmentEndTime(appointment)
  if (!end) return false
  return end.getTime() < Date.now()
}

/**
 * If the appointment window has ended, set availability to `completed` (unless cancelled).
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function ensureCompletedIfPast(appointment) {
  if (!appointment) return appointment
  if (!isAppointmentPast(appointment)) return appointment
  if (appointment.availability === 'cancelled') return appointment
  if (appointment.availability === 'completed') return appointment
  if (appointment.availability === 'free' || appointment.availability === 'booked') {
    appointment.availability = 'completed'
    await appointment.save()
  }
  return appointment
}

module.exports = {
  getAppointmentEndTime,
  isAppointmentPast,
  ensureCompletedIfPast,
}
