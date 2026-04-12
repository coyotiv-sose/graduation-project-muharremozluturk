function refIdString(ref) {
  if (ref == null) return null
  return (ref._id != null ? ref._id : ref).toString()
}

module.exports = {
  refIdString,
}
