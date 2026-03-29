function roleOfUser(user) {
  if (!user || !user.constructor) {
    return null
  }
  if (user.constructor.modelName === 'Client') {
    return 'client'
  }
  if (user.constructor.modelName === 'Expert') {
    return 'expert'
  }
  return null
}

function refId(ref) {
  if (ref == null) return null
  if (typeof ref === 'object' && ref._id != null) return String(ref._id)
  return String(ref)
}

function sanitizeClientPublic(clientDoc) {
  if (clientDoc == null) return undefined
  if (typeof clientDoc !== 'object') return clientDoc
  const o = clientDoc.toObject ? clientDoc.toObject() : { ...clientDoc }
  delete o.hash
  delete o.salt
  return o
}

/**
 * Removes `client` from appointment JSON unless the viewer may see it:
 * — logged-in client: only for appointments they booked
 * — logged-in expert: only for appointments on their own calendar
 * Anonymous viewers never receive `client`.
 */
function sanitizeAppointmentForRequest(appointment, req) {
  const o = appointment.toObject ? appointment.toObject({ virtuals: true }) : { ...appointment }
  const user = req.user
  const clientId = refId(o.client)
  const expertId = refId(o.expert)

  if (!user) {
    if (Object.prototype.hasOwnProperty.call(o, 'client')) {
      delete o.client
    }
    return o
  }

  const viewerRole = roleOfUser(user)
  const viewerId = refId(user)

  if (viewerRole === 'client') {
    if (!clientId || clientId !== viewerId) {
      delete o.client
    } else if (o.client && typeof o.client === 'object') {
      o.client = sanitizeClientPublic(o.client)
    }
    return o
  }

  if (viewerRole === 'expert') {
    if (!expertId || expertId !== viewerId) {
      delete o.client
    } else if (o.client && typeof o.client === 'object') {
      o.client = sanitizeClientPublic(o.client)
    }
    return o
  }

  delete o.client
  return o
}

module.exports = {
  sanitizeAppointmentForRequest,
  roleOfUser,
}
