const Expert = require('./models/expert.js')
const Client = require('./models/client.js')
const Session = require('./models/session.js')

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

const oneToOneSession = expert.createSession(oneToOneStart, oneToOneEnd, 'free')

// Client books the one-to-one session
client1.bookSession(oneToOneSession)

// Create another session that will be cancelled
const cancelledStart = new Date(tomorrow)
cancelledStart.setHours(12, 0, 0, 0)

const cancelledEnd = new Date(cancelledStart)
cancelledEnd.setHours(13, 0, 0, 0)

const cancelledBookingbyClient = expert.createSession(cancelledStart, cancelledEnd, 'free')

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

console.log('\n=== Expert Available Sessions ===')
expert.sessions
  .filter(session => session.status === 'free')
  .forEach(session => {
    console.log(
      `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status}, Clients: ${session.clients.length})`
    )
  })

console.log('\n=== Expert Booked Sessions ===')
expert.sessions
  .filter(session => session.status === 'booked')
  .forEach(session => {
    console.log(
      `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Clients: ${session.clients.length})`
    )
  })

console.log('\n=== Client 1 Booked Sessions ===')
Session.list
  .filter(session => session.clients.includes(client1))
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

console.log('\n=== Client 1 Cancelled Sessions ===')
Session.list
  .filter(session => session.status === 'cancelled')
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

const cancelledBookingbyExpert = expert.createSession(
  new Date(tomorrow.setHours(15, 0, 0, 0)),
  new Date(tomorrow.setHours(16, 0, 0, 0)),
  'free'
)

client2.bookSession(cancelledBookingbyExpert)
console.log('\n=== Client 2 Booked Sessions Before Cancellation ===')
Session.list
  .filter(session => session.clients.includes(client2))
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

console.log('\n=== Client 2 Cancelled Sessions Before Cancellation ===')
Session.list
  .filter(session => session.status === 'cancelled')
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })
expert.cancelBooking(cancelledBookingbyExpert)

console.log('\n=== Expert Available Sessions After Cancellation ===')
expert.sessions
  .filter(session => session.status === 'free')
  .forEach(session => {
    console.log(
      `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status}, Clients: ${session.clients.length})`
    )
  })

console.log('\n=== Expert Booked Sessions After Cancellation ===')
expert.sessions
  .filter(session => session.status === 'booked')
  .forEach(session => {
    console.log(
      `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Clients: ${session.clients.length})`
    )
  })

console.log('\n=== Client 2 Booked Sessions After Cancellation ===')
Session.list
  .filter(session => session.clients.includes(client2))
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

console.log('\n=== Client 2 Cancelled Sessions After Cancellation ===')
Session.list
  .filter(session => session.status === 'cancelled')
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

const cancelledSession = expert.createSession(
  new Date(tomorrow.setHours(17, 0, 0, 0)),
  new Date(tomorrow.setHours(18, 0, 0, 0)),
  'free'
)

client3.bookSession(cancelledSession)
console.log('\n=== Client 3 Booked Sessions Before Cancellation ===')
Session.list
  .filter(session => session.clients.includes(client3))
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

console.log('\n=== Client 3 Cancelled Sessions Before Cancellation ===')
Session.list
  .filter(session => session.status === 'cancelled')
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

expert.cancelSession(cancelledSession)
console.log('\n=== Expert Available Sessions After Cancellation ===')
expert.sessions
  .filter(session => session.status === 'free')
  .forEach(session => {
    console.log(
      `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status}, Clients: ${session.clients.length})`
    )
  })

console.log('\n=== Expert Booked Sessions After Cancellation ===')
expert.sessions
  .filter(session => session.status === 'booked')
  .forEach(session => {
    console.log(
      `- Session ${session.id}: ${session.startTime} to ${session.endTime} (Clients: ${session.clients.length})`
    )
  })

console.log('\n=== Client 3 Booked Sessions After Cancellation ===')
Session.list
  .filter(session => session.clients.includes(client3))
  .forEach(session => {
    console.log(`- Session ${session.id}: ${session.startTime} to ${session.endTime} (Status: ${session.status})`)
  })

console.log('\n=== Client 3 Cancelled Sessions After Cancellation ===')
Session.list
  .filter(session => session.status === 'cancelled')
  .forEach(session => {
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
  
  const availableSession = testExpert.createSession(testDate, testEnd, 'free')
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
  
  const bookedSession = testExpert.createSession(testDate, testEnd, 'free')
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
  
  const otherSession = otherExpert.createSession(otherDate, otherEnd, 'free')
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
  
  const session = testExpert.createSession(testDate, testEnd, 'free')
  
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
  //const Session = require('./models/session.js')
  //const fakeSession = new Session(999999, testExpert, new Date(), new Date(), 'free', 1)
  const fakeSession = Session.create({id: 999999, expert: testExpert, startTime: new Date(), endTime: new Date(), status: 'free'});
  // Manually remove it from arrays if it was added
  testExpert.sessions = testExpert.sessions.filter(s => s.id !== fakeSession.id)

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
  session1Start.setHours(8, 0, 0, 0)
  const session1End = new Date(session1Start)
  session1End.setHours(9, 0, 0, 0)
  const session1 = testExpert.createSession(session1Start, session1End, 'free')
  
  // Create second session: 12:00 - 13:00
  const session2Start = new Date(testDate)
  session2Start.setHours(12, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(13, 0, 0, 0)
  const session2 = testExpert.createSession(session2Start, session2End, 'free')
  
  // Try to reschedule session2 to conflict with session1 (10:30 - 11:30)
  const conflictStart = new Date(testDate)
  conflictStart.setHours(8, 30, 0, 0)
  const conflictEnd = new Date(conflictStart)
  conflictEnd.setHours(9, 30, 0, 0)
  
  testExpert.rescheduleSession(session2, conflictStart, conflictEnd)
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'New time slot conflicts with existing session') {
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
  const bookedSession1 = testExpert.createSession(booked1Start, booked1End, 'free')
  testClient.bookSession(bookedSession1)
  
  // Create second session: 12:00 - 13:00
  const session2Start = new Date(testDate)
  session2Start.setHours(12, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(13, 0, 0, 0)
  const session2 = testExpert.createSession(session2Start, session2End, 'free')
  
  // Try to reschedule session2 to conflict with bookedSession1 (10:30 - 11:30)
  const conflictStart = new Date(testDate)
  conflictStart.setHours(10, 30, 0, 0)
  const conflictEnd = new Date(conflictStart)
  conflictEnd.setHours(11, 30, 0, 0)
  
  testExpert.rescheduleSession(session2, conflictStart, conflictEnd)
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'New time slot conflicts with existing session') {
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
  const session1 = testExpert.createSession(session1Start, session1End, 'free')
  
  // Create second session: 12:00 - 13:00
  const session2Start = new Date(testDate)
  session2Start.setHours(12, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(13, 0, 0, 0)
  const session2 = testExpert.createSession(session2Start, session2End, 'free')
  
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

// ============================================
// Tests for Session Completion Workflow
// ============================================
console.log('\n\n=== SESSION COMPLETION WORKFLOW TESTS ===\n')

// Create test expert and clients for completion tests
const completionExpert = new Expert('Dr. Completion Expert', 'completion@example.com', '+1111111111', 'Completion Testing', 200)
const completionClient1 = new Client('Completion Client 1', 'cc1@example.com', '+2222222222')
const completionClient2 = new Client('Completion Client 2', 'cc2@example.com', '+2222222223')

// Test 1: Manually mark session as completed
console.log('Test 1: Manually mark session as completed')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(10, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(11, 0, 0, 0)
  
  const sessionToComplete = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(sessionToComplete)
  
  console.log(`  Before: Status = ${sessionToComplete.status}`)
  completionExpert.completeSession(sessionToComplete)
  console.log(`  After: Status = ${sessionToComplete.status}`)
  console.log('✓ PASS: Session marked as completed successfully')
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 2: Error - Cannot complete free session
console.log('\nTest 2: Error when trying to complete a free session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(12, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(13, 0, 0, 0)
  
  const freeSession = completionExpert.createSession(testDate, testEnd, 'free')
  freeSession.markAsCompleted()
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Cannot complete a free (unbooked) session') {
    console.log('✓ PASS: Correctly rejected completion of free session')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 3: Error - Cannot complete cancelled session
console.log('\nTest 3: Error when trying to complete a cancelled session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(14, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(15, 0, 0, 0)
  
  const cancelledSession = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(cancelledSession)
  cancelledSession.status = 'cancelled'
  cancelledSession.markAsCompleted()
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Cannot complete a cancelled session') {
    console.log('✓ PASS: Correctly rejected completion of cancelled session')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 4: Add expert notes to session
console.log('\nTest 4: Add expert notes to a session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(16, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(17, 0, 0, 0)
  
  const sessionWithNotes = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(sessionWithNotes)
  completionExpert.completeSession(sessionWithNotes)
  
  const notes = 'Great session! Client showed excellent progress in understanding the concepts.'
  completionExpert.addSessionNotes(sessionWithNotes, notes)
  
  console.log('✓ PASS: Expert notes added successfully')
  console.log(`  Notes: "${sessionWithNotes.expertNotes}"`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 5: Error - Add notes with invalid input
console.log('\nTest 5: Error when adding empty notes')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(18, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(19, 0, 0, 0)
  
  const session = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(session)
  session.addExpertNotes('   ') // Empty/whitespace only
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Notes must be a non-empty string') {
    console.log('✓ PASS: Correctly rejected empty notes')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 6: Add review from client
console.log('\nTest 6: Client leaves a review for completed session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(20, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(21, 0, 0, 0)
  
  const reviewableSession = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(reviewableSession)
  completionExpert.completeSession(reviewableSession)
  
  const review = completionClient1.leaveReview(reviewableSession, 5, 'Excellent session! Very helpful and informative.')
  
  console.log('✓ PASS: Review added successfully')
  console.log(`  Rating: ${review.rating}/5`)
  console.log(`  Comment: "${review.comment}"`)
  console.log(`  Average rating: ${reviewableSession.getAverageRating()}/5`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 7: Error - Review before session is completed
console.log('\nTest 7: Error when trying to review a non-completed session')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 1)
  testDate.setHours(22, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(23, 0, 0, 0)
  
  const incompleteSession = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(incompleteSession)
  // Don't complete the session
  completionClient1.leaveReview(incompleteSession, 4, 'Good session')
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'You can only review completed sessions') {
    console.log('✓ PASS: Correctly rejected review for incomplete session')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 8: Error - Invalid rating
console.log('\nTest 8: Error when rating is out of range')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 2)
  testDate.setHours(10, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(11, 0, 0, 0)
  
  const session = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(session)
  completionExpert.completeSession(session)
  completionClient1.leaveReview(session, 6) // Invalid rating
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Rating must be an integer between 1 and 5') {
    console.log('✓ PASS: Correctly rejected invalid rating')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 10: Error - Duplicate review from same client
console.log('\nTest 10: Error when client tries to review twice')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 2)
  testDate.setHours(18, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(19, 0, 0, 0)
  
  const session = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(session)
  completionExpert.completeSession(session)
  
  completionClient1.leaveReview(session, 5, 'First review')
  completionClient1.leaveReview(session, 4, 'Second review') // Should fail
  console.log('✗ FAIL: Should have thrown an error')
} catch (error) {
  if (error.message === 'Client has already reviewed this session') {
    console.log('✓ PASS: Correctly prevented duplicate review')
  } else {
    console.log('✗ FAIL: Wrong error message:', error.message)
  }
}

// Test 11: Automatic completion when endTime passes
console.log('\nTest 11: Automatic completion when endTime passes')
try {
  // Create a session in the past
  const pastDate = new Date()
  pastDate.setDate(pastDate.getDate() - 1) // Yesterday
  pastDate.setHours(10, 0, 0, 0)
  
  const pastEnd = new Date(pastDate)
  pastEnd.setHours(11, 0, 0, 0)
  
  const pastSession = completionExpert.createSession(pastDate, pastEnd, 'free')
  completionClient1.bookSession(pastSession)
  
  console.log(`  Before check: Status = ${pastSession.status}`)
  const wasCompleted = pastSession.checkCompletionStatus()
  console.log(`  After check: Status = ${pastSession.status}`)
  console.log(`  Was auto-completed: ${wasCompleted}`)
  
  if (wasCompleted && pastSession.status === 'completed') {
    console.log('✓ PASS: Session automatically completed')
  } else {
    console.log('✗ FAIL: Session was not auto-completed')
  }
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 12: Expert checks and completes all sessions
console.log('\nTest 12: Expert checks and auto-completes all past sessions')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() - 1)
  
  // Create multiple past sessions
  const session1Start = new Date(testDate)
  session1Start.setHours(9, 0, 0, 0)
  const session1End = new Date(session1Start)
  session1End.setHours(10, 0, 0, 0)
  const pastSession1 = completionExpert.createSession(session1Start, session1End, 'free')
  completionClient1.bookSession(pastSession1)
  
  const session2Start = new Date(testDate)
  session2Start.setHours(11, 0, 0, 0)
  const session2End = new Date(session2Start)
  session2End.setHours(12, 0, 0, 0)
  const pastSession2 = completionExpert.createSession(session2Start, session2End, 'free')
  completionClient2.bookSession(pastSession2)
  
  const completed = completionExpert.checkAndCompleteSessions()
  console.log(`  Auto-completed sessions: ${completed.length}`)
  console.log(`  Completed sessions: ${completionExpert.getCompletedSessions().length}`)
  
  if (completed.length >= 2) {
    console.log('✓ PASS: Expert auto-completed past sessions')
  } else {
    console.log('✗ FAIL: Not all sessions were auto-completed')
  }
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 13: Expert average rating calculation
console.log('\nTest 13: Expert average rating across all sessions')
try {
  // Add reviews to previously completed sessions
  const completedSessions = completionExpert.getCompletedSessions()
  if (completedSessions.length > 0) {
    // Add reviews to first few completed sessions
    completedSessions.slice(0, 2).forEach((session, index) => {
      if (session.clients.length > 0 && session.reviews.length === 0) {
        const client = session.clients[0]
        try {
          session.addReview(client, 4 + index, `Review ${index + 1}`)
        } catch (e) {
          // Review might already exist, skip
        }
      }
    })
  }
  
  const avgRating = completionExpert.getAverageRating()
  console.log('✓ PASS: Expert average rating calculated')
  console.log(`  Average rating: ${avgRating ? avgRating + '/5' : 'No ratings yet'}`)
  console.log(`  Total completed sessions: ${completionExpert.getCompletedSessions().length}`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

// Test 14: Get session info with all new fields
console.log('\nTest 14: Get complete session info with notes and reviews')
try {
  const testDate = new Date()
  testDate.setDate(testDate.getDate() + 3)
  testDate.setHours(10, 0, 0, 0)
  
  const testEnd = new Date(testDate)
  testEnd.setHours(11, 0, 0, 0)
  
  const fullSession = completionExpert.createSession(testDate, testEnd, 'free')
  completionClient1.bookSession(fullSession)
  completionExpert.completeSession(fullSession)
  completionExpert.addSessionNotes(fullSession, 'Client made excellent progress')
  completionClient1.leaveReview(fullSession, 5, 'Perfect session!')
  
  const sessionInfo = fullSession.getSessionInfo()
  console.log('✓ PASS: Complete session info retrieved')
  console.log(`  Status: ${sessionInfo.status}`)
  console.log(`  Expert notes: "${sessionInfo.expertNotes}"`)
  console.log(`  Reviews: ${sessionInfo.reviews.length}`)
  console.log(`  Average rating: ${sessionInfo.averageRating}/5`)
} catch (error) {
  console.log('✗ FAIL:', error.message)
}

console.log('\n=== END OF SESSION COMPLETION WORKFLOW TESTS ===\n')

/* Tests with AXIOS */
const axios = require('axios');
const api = axios.create({
  baseURL: 'http://localhost:3000',
});

async function runTests() {
  try {
    const postExpertResponse = await api.post('/experts', {
      name: 'Dr. Test Expert',
      email: 'test@example.com',
      phone: '+1234567899',
      specialization: 'Testing',
      hourlyRate: 150
    });
    console.log('POST /experts');
    console.log(postExpertResponse.data);

    const postClientResponse = await api.post('/clients', {
      name: 'Test Client',
      email: 'testclient@example.com',
      phone: '+1234567898'
    });
    console.log('POST /clients');
    console.log(postClientResponse.data);

    const getExpertsResponse = await api.get('/experts');
    console.log('GET /experts');
    console.log(getExpertsResponse.data);

    const getExpertWithIdResponse = await api.get('/experts/561e6ad3dd');
    console.log('GET /experts/:expertId');
    console.log(getExpertWithIdResponse.data);

    const getClientsResponse = await api.get('/clients');
    console.log('GET /clients');
    console.log(getClientsResponse.data);

    const getClientWithIdResponse = await api.get('/clients/db6f68b3ff');
    console.log('GET /clients/:clientId');
    console.log(getClientWithIdResponse.data);

    const postSessionResponse = await api.post('/experts/561e6ad3dd/sessions', {
      startTime: '2026-02-02T10:00:00',
      endTime: '2026-02-02T11:00:00',
      status: 'free'
    });
    console.log('POST /experts/:expertId/sessions');
    console.log(postSessionResponse.data);

    const getSessionsResponse = await api.get('/experts/561e6ad3dd/sessions');
    console.log('GET /experts/:expertId/sessions');
    console.log(getSessionsResponse.data);

    const postParticipantResponse = await api.post('/clients/db6f68b3ff/sessions/60c7f93983/participants');
    console.log('POST /clients/:clientId/sessions/:sessionId/participants');
    console.log(postParticipantResponse.data);
  }
  catch (error) {
    console.error(error);
  }
}

runTests();
