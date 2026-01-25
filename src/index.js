const Expert = require('./expert.js')
const Client = require('./client.js')

// Create an expert
const expert = new Expert('Dr. John Smith', 'john.smith@example.com', '+1234567890', 'Software Engineering', 100)

// Create clients
const client1 = new Client('Alice Johnson', 'alice@example.com', '+1234567891')

const client2 = new Client('Bob Williams', 'bob@example.com', '+1234567892')

const client3 = new Client('Charlie Brown', 'charlie@example.com', '+1234567893')

// Set up expert's available sessions
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(9, 0, 0, 0)

// Create a one-to-one session (maxParticipants = 1)
const oneToOneStart = new Date(tomorrow)
oneToOneStart.setHours(10, 0, 0, 0)

const oneToOneEnd = new Date(oneToOneStart)
oneToOneEnd.setHours(11, 0, 0, 0)

const oneToOneSession = expert.createSession(oneToOneStart, oneToOneEnd, 'free', 1)

// Client books the one-to-one session
client1.bookSession(oneToOneSession)

// Create a group session (maxParticipants = 5)
const groupStart = new Date(tomorrow)
groupStart.setHours(14, 0, 0, 0)

const groupEnd = new Date(groupStart)
groupEnd.setHours(16, 0, 0, 0)

const groupSession = expert.createSession(groupStart, groupEnd, 'free', 5)

// Clients book the group session
client2.bookSession(groupSession)
client3.bookSession(groupSession)

// Create another session that will be cancelled
const cancelledStart = new Date(tomorrow)
cancelledStart.setHours(12, 0, 0, 0)

const cancelledEnd = new Date(cancelledStart)
cancelledEnd.setHours(13, 0, 0, 0)

const cancelledBookingbyClient = expert.createSession(cancelledStart, cancelledEnd, 'free', 1)

// Client books and then cancels the session
client1.bookSession(cancelledBookingbyClient)
client1.cancelBooking(cancelledBookingbyClient)
// Display information
console.log('=== Expert Information ===')
console.log(JSON.stringify(expert.getExpertInfo(), null, 2))

console.log('\n=== Client 1 Information ===')
console.log(JSON.stringify(client1.getClientInfo(), null, 2))

console.log('\n=== Client 2 Information ===')
console.log(JSON.stringify(client2.getClientInfo(), null, 2))

console.log('\n=== One-to-One Session Info ===')
console.log(JSON.stringify(oneToOneSession.getSessionInfo(), null, 2))

console.log('\n=== Group Session Info ===')
console.log(JSON.stringify(groupSession.getSessionInfo(), null, 2))

console.log('\n=== Expert Available Sessions ===')
expert.availableSessions.forEach(session => {
  console.log(
    `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status}, Max: ${session.maxParticipants}, Clients: ${session.clients.length})`
  )
})

console.log('\n=== Expert Booked Sessions ===')
expert.bookings.forEach(session => {
  console.log(
    `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Clients: ${session.clients.length}/${session.maxParticipants})`
  )
})

console.log('\n=== Client 1 Booked Sessions ===')
client1.bookedSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

console.log('\n=== Client 1 Cancelled Sessions ===')
client1.cancelledSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

const cancelledBookingbyExpert = expert.createSession(
  new Date(tomorrow.setHours(15, 0, 0, 0)),
  new Date(tomorrow.setHours(16, 0, 0, 0)),
  'free',
  1
)

client2.bookSession(cancelledBookingbyExpert)
console.log('\n=== Client 2 Booked Sessions Before Cancellation ===')
client2.bookedSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

console.log('\n=== Client 2 Cancelled Sessions Before Cancellation ===')
client2.cancelledSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})
expert.cancelBooking(cancelledBookingbyExpert)

console.log('\n=== Expert Available Sessions After Cancellation ===')
expert.availableSessions.forEach(session => {
  console.log(
    `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status}, Max: ${session.maxParticipants}, Clients: ${session.clients.length})`
  )
})

console.log('\n=== Expert Booked Sessions After Cancellation ===')
expert.bookings.forEach(session => {
  console.log(
    `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Clients: ${session.clients.length}/${session.maxParticipants})`
  )
})

console.log('\n=== Client 2 Booked Sessions After Cancellation ===')
client2.bookedSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

console.log('\n=== Client 2 Cancelled Sessions After Cancellation ===')
client2.cancelledSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

const cancelledSession = expert.createSession(
  new Date(tomorrow.setHours(17, 0, 0, 0)),
  new Date(tomorrow.setHours(18, 0, 0, 0)),
  'free',
  1
)

client3.bookSession(cancelledSession)
console.log('\n=== Client 3 Booked Sessions Before Cancellation ===')
client3.bookedSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

console.log('\n=== Client 3 Cancelled Sessions Before Cancellation ===')
client3.cancelledSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

expert.cancelSession(cancelledSession)
console.log('\n=== Expert Available Sessions After Cancellation ===')
expert.availableSessions.forEach(session => {
  console.log(
    `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status}, Max: ${session.maxParticipants}, Clients: ${session.clients.length})`
  )
})

console.log('\n=== Expert Booked Sessions After Cancellation ===')
expert.bookings.forEach(session => {
  console.log(
    `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Clients: ${session.clients.length}/${session.maxParticipants})`
  )
})

console.log('\n=== Client 3 Booked Sessions After Cancellation ===')
client3.bookedSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

console.log('\n=== Client 3 Cancelled Sessions After Cancellation ===')
client3.cancelledSessions.forEach(session => {
  console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
})

console.log(client1.profile)
console.log(client2.profile)
console.log(client3.profile)
console.log(expert.profile)

// ============================================
// Tests for rescheduleSession function
// ============================================
console.log('\n\n=== RESCHEDULE SESSION TESTS ===\n')

// Create a new expert for testing
const testExpert = new Expert('Dr. Test Expert', 'test@example.com', '+1234567899', 'Testing', 150)
const testClient = new Client('Test Client', 'testclient@example.com', '+1234567898')

// Test 1: Successfully reschedule an available session
console.log('Test 1: Reschedule an available session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 2)
  testDate.setHours(10, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(11, 0, 0, 0)
  
  const availableSession = testExpert.createSession(testDate, testEnd, 'free', 1)
  const originalStart = new Date(availableSession.startTime)
  const originalEnd = new Date(availableSession.endTime)
  
  // Reschedule to 2 hours later
  const newStart = new Date(testDate)
  newStart.setHours(14, 0, 0, 0)
  const newEnd = new Date(newStart)
  newEnd.setHours(15, 0, 0, 0)
  
  const rescheduled = testExpert.rescheduleSession(availableSession, newStart, newEnd)
  
  console.log('✓ PASS: Session rescheduled successfully')
  console.log(`  Original: ${originalStart.toLocaleString()} - ${originalEnd.toLocaleString()}`)
  console.log(`  New: ${rescheduled.startTime.toLocaleString()} - ${rescheduled.endTime.toLocaleString()}`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 2: Successfully reschedule a booked session
console.log('\nTest 2: Reschedule a booked session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 2)
  testDate.setHours(16, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(17, 0, 0, 0)
  
  const bookedSession = testExpert.createSession(testDate, testEnd, 'free', 1)
  testClient.bookSession(bookedSession)
  
  const originalStart = new Date(bookedSession.startTime)
  const originalEnd = new Date(bookedSession.endTime)
  
  // Reschedule to 1 hour later
  const newStart = new Date(testDate)
  newStart.setHours(18, 0, 0, 0)
  const newEnd = new Date(newStart)
  newEnd.setHours(19, 0, 0, 0)
  
  const rescheduled = testExpert.rescheduleSession(bookedSession, newStart, newEnd)
  
  console.log('✓ PASS: Booked session rescheduled successfully')
  console.log(`  Original: ${originalStart.toLocaleString()} - ${originalEnd.toLocaleString()}`)
  console.log(`  New: ${rescheduled.startTime.toLocaleString()} - ${rescheduled.endTime.toLocaleString()}`)
  console.log(`  Status: ${rescheduled.status}`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 3: Error - Invalid session (not a Session instance)
console.log('\nTest 3: Error when session is not a Session instance')
try {
  testExpert.rescheduleSession(null, new Date(), new Date())
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Invalid session') {
    console.log('✓ PASS: Correctly rejected invalid session')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 4: Error - Session doesn't belong to expert
console.log('\nTest 4: Error when session belongs to different expert')
try {
  const otherExpert = new Expert('Other Expert', 'other@example.com', '+1234567897', 'Other', 200)
  const otherDate = new Date()
  otherDate.setDate(otherDate.getDate() + 2)
  otherDate.setHours(20, 0, 0, 0)
  
  const otherEnd = new Date(otherDate)
  otherEnd.setHours(21, 0, 0, 0)
  
  const otherSession = otherExpert.createSession(otherDate, otherEnd, 'free', 1)
  testExpert.rescheduleSession(otherSession, new Date(), new Date())
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Session does not belong to this expert') {
    console.log('✓ PASS: Correctly rejected session from different expert')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 5: Error - End time before/equal to start time
console.log('\nTest 5: Error when end time is before or equal to start time')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 3)
  testDate.setHours(10, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(11, 0, 0, 0)
  
  const session = testExpert.createSession(testDate, testEnd, 'free', 1)
  
  // Try to reschedule with end before start
  const invalidStart = new Date(testDate)
  invalidStart.setHours(12, 0, 0, 0)
  const invalidEnd = new Date(testDate)
  invalidEnd.setHours(11, 0, 0, 0) // Before start
  
  testExpert.rescheduleSession(session, invalidStart, invalidEnd)
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'End time must be after start time') {
    console.log('✓ PASS: Correctly rejected invalid time range')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 6: Error - Session not found in expert's sessions
console.log('\nTest 6: Error when session not found in expert sessions')
try {
  // Create a session but don't add it to expert (simulate missing session)
  const Session = require('./session.js')
  const fakeSession = new Session(999999, testExpert, new Date(), new Date(), 'free', 1)
  // Manually remove it from arrays if it was added
  testExpert.availableSessions = testExpert.availableSessions.filter(s => s.id !== fakeSession.id)
  testExpert.bookings = testExpert.bookings.filter(s => s.id !== fakeSession.id)
  
  const newStart = new Date()
  newStart.setDate(newStart.getDate() + 3)
  newStart.setHours(10, 0, 0, 0)
  const newEnd = new Date(newStart)
  newEnd.setHours(11, 0, 0, 0)
  
  testExpert.rescheduleSession(fakeSession, newStart, newEnd)
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Session not found in expert sessions') {
    console.log('✓ PASS: Correctly rejected session not in expert sessions')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 7: Error - Conflict with available session
console.log('\nTest 7: Error when new time conflicts with available session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 3)
  
  // Create first session: 10:00 - 11:00
  const session1Start = new Date(testDate)
  session1Start.setHours(10, 0, 0, 0)
  const session1End = new Date(session1Start)
  session1End.setHours(11, 0, 0, 0)
  const session1 = testExpert.createSession(session1Start, session1End, 'free', 1)
  
  // Create second session: 12:00 - 13:00
  const session2Start = new Date(testDate)
  session2Start.setHours(12, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(13, 0, 0, 0)
  const session2 = testExpert.createSession(session2Start, session2End, 'free', 1)
  
  // Try to reschedule session2 to conflict with session1 (10:30 - 11:30)
  const conflictStart = new Date(testDate)
  conflictStart.setHours(10, 30, 0, 0)
  const conflictEnd = new Date(conflictStart)
  conflictEnd.setHours(11, 30, 0, 0)
  
  testExpert.rescheduleSession(session2, conflictStart, conflictEnd)
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'New time slot conflicts with existing available session') {
    console.log('✓ PASS: Correctly detected conflict with available session')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 8: Error - Conflict with booked session
console.log('\nTest 8: Error when new time conflicts with booked session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 4)
  
  // Create and book first session: 10:00 - 11:00
  const booked1Start = new Date(testDate)
  booked1Start.setHours(10, 0, 0, 0)
  const booked1End = new Date(booked1Start)
  booked1End.setHours(11, 0, 0, 0)
  const bookedSession1 = testExpert.createSession(booked1Start, booked1End, 'free', 1)
  testClient.bookSession(bookedSession1)
  
  // Create second session: 12:00 - 13:00
  const session2Start = new Date(testDate)
  session2Start.setHours(12, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(13, 0, 0, 0)
  const session2 = testExpert.createSession(session2Start, session2End, 'free', 1)
  
  // Try to reschedule session2 to conflict with bookedSession1 (10:30 - 11:30)
  const conflictStart = new Date(testDate)
  conflictStart.setHours(10, 30, 0, 0)
  const conflictEnd = new Date(conflictStart)
  conflictEnd.setHours(11, 30, 0, 0)
  
  testExpert.rescheduleSession(session2, conflictStart, conflictEnd)
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'New time slot conflicts with existing booked session') {
    console.log('✓ PASS: Correctly detected conflict with booked session')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 9: Success - Reschedule without conflicts (edge case: adjacent times)
console.log('\nTest 9: Successfully reschedule to adjacent time (no conflict)')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 5)
  
  // Create first session: 10:00 - 11:00
  const session1Start = new Date(testDate)
  session1Start.setHours(10, 0, 0, 0)
  const session1End = new Date(session1Start)
  session1End.setHours(11, 0, 0, 0)
  const session1 = testExpert.createSession(session1Start, session1End, 'free', 1)
  
  // Create second session: 12:00 - 13:00
  const session2Start = new Date(testDate)
  session2Start.setHours(12, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(13, 0, 0, 0)
  const session2 = testExpert.createSession(session2Start, session2End, 'free', 1)
  
  // Reschedule session2 to end exactly when session1 starts (11:00 - 12:00) - no conflict
  const newStart = new Date(testDate)
  newStart.setHours(11, 0, 0, 0)
  const newEnd = new Date(testDate)
  newEnd.setHours(12, 0, 0, 0)
  
  const rescheduled = testExpert.rescheduleSession(session2, newStart, newEnd)
  console.log('✓ PASS: Successfully rescheduled to adjacent time (no conflict)')
  console.log(`  New time: ${rescheduled.startTime.toLocaleString()} - ${rescheduled.endTime.toLocaleString()}`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

console.log('\n=== END OF RESCHEDULE SESSION TESTS ===\n')
