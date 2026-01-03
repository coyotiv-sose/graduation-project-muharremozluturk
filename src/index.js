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

const cancelledSession = expert.createSession(cancelledStart, cancelledEnd, 'free', 1)

// Client books and then cancels the session
client1.bookSession(cancelledSession)
client1.cancelBooking(cancelledSession)

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
