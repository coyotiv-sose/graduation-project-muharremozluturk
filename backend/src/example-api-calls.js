/* Example API calls with axios — run while the server is listening on baseURL */
const axios = require('axios')

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
})

const DEFAULT_PASSWORD = '123456.'

/** How many free time slots to create per expert */
const APPOINTMENTS_PER_EXPERT = 3

const expertsToCreate = [
  {
    name: 'Dr. Alice Chen',
    email: 'alice.chen@example.com',
    phone: '+15550000001',
    specialization: 'Clinical psychology',
    hourlyRate: 120,
  },
  {
    name: 'Dr. Ben Ortiz',
    email: 'ben.ortiz@example.com',
    phone: '+15550000002',
    specialization: 'Career coaching',
    hourlyRate: 95,
  },
  {
    name: 'Dr. Carla Mbeki',
    email: 'carla.mbeki@example.com',
    phone: '+15550000003',
    specialization: 'Nutrition',
    hourlyRate: 110,
  },
  {
    name: 'Dr. David Kim',
    email: 'david.kim@example.com',
    phone: '+15550000004',
    specialization: 'Physiotherapy',
    hourlyRate: 130,
  },
  {
    name: 'Dr. Elena Petrova',
    email: 'elena.petrova@example.com',
    phone: '+15550000005',
    specialization: 'Sleep medicine',
    hourlyRate: 140,
  },
]

const clientsToCreate = [
  { name: 'Dana Lee', email: 'dana.lee@example.com', phone: '+15550001001' },
  { name: 'Evan Novak', email: 'evan.novak@example.com', phone: '+15550001002' },
  { name: 'Fatima Rahman', email: 'fatima.rahman@example.com', phone: '+15550001003' },
  { name: 'Grace Okafor', email: 'grace.okafor@example.com', phone: '+15550001004' },
  { name: 'Hassan Ibrahim', email: 'hassan.ibrahim@example.com', phone: '+15550001005' },
]

/**
 * Build non-overlapping slot times for one expert (same calendar day, different hours).
 * expertIndex shifts the day so experts do not share identical timestamps.
 */
function slotTimes(expertIndex, slotIndex) {
  const day = 10 + expertIndex
  const base = `2026-06-${String(day).padStart(2, '0')}T`
  const hours = [9, 13, 16]
  const h = hours[slotIndex % hours.length]
  const start = new Date(`${base}${String(h).padStart(2, '0')}:00:00.000Z`)
  const end = new Date(start.getTime() + 60 * 60 * 1000)
  return { startTime: start, endTime: end }
}

async function loginExpert(email, password) {
  await api.post('/accounts/session?role=expert', { email, password })
}

async function postFreeAppointment(startTime, endTime, email, password) {
  await loginExpert(email, password)
  const res = await api.post('/appointments', { startTime, endTime })
  return res.data
}

async function loginClient(email, password) {
  await api.post('/accounts/session?role=client', { email, password })
}

async function bookAppointment(appointmentId, clientEmail, password) {
  await loginClient(clientEmail, password)
  const res = await api.post(`/appointments/${appointmentId}/client`, {})
  return res.data
}

async function runTests() {
  try {
    const experts = []
    for (const body of expertsToCreate) {
      const res = await api.post('/experts', { ...body, password: DEFAULT_PASSWORD })
      experts.push(res.data)
      console.log('POST /experts', body.email, '→', res.data._id)
    }

    const clients = []
    for (const body of clientsToCreate) {
      const res = await api.post('/clients', { ...body, password: DEFAULT_PASSWORD })
      clients.push(res.data)
      console.log('POST /clients', body.email, '→', res.data._id)
    }

    /** appointmentsByExpert[e] = array of appointment docs for experts[e] */
    const appointmentsByExpert = []
    for (let e = 0; e < experts.length; e += 1) {
      const list = []
      for (let s = 0; s < APPOINTMENTS_PER_EXPERT; s += 1) {
        const { startTime, endTime } = slotTimes(e, s)
        const appointment = await postFreeAppointment(
          startTime,
          endTime,
          expertsToCreate[e].email,
          DEFAULT_PASSWORD,
        )
        list.push(appointment)
        console.log(`POST /appointments (expert ${e + 1}, slot ${s + 1})`, appointment._id)
      }
      appointmentsByExpert.push(list)
    }

    // Dana: 1 booked appointment — first slot of expert 0
    await bookAppointment(appointmentsByExpert[0][0]._id, clientsToCreate[0].email, DEFAULT_PASSWORD)
    console.log('BOOKED: client', clients[0].email, '→ appointment', appointmentsByExpert[0][0]._id)

    // Evan: 1 booked appointment — first slot of expert 1 (different expert)
    await bookAppointment(appointmentsByExpert[1][0]._id, clientsToCreate[1].email, DEFAULT_PASSWORD)
    console.log('BOOKED: client', clients[1].email, '→ appointment', appointmentsByExpert[1][0]._id)

    // Fatima, Grace, Hassan: no bookings (only free slots remain for them to use later)

    const allAppointments = (await api.get('/appointments')).data
    const booked = allAppointments.filter((a) => a.availability === 'booked')
    const free = allAppointments.filter((a) => a.availability === 'free')

    console.log('\nSummary')
    console.log('  Experts:', experts.length, '| Clients:', clients.length)
    console.log('  Appointments total:', allAppointments.length, `(${booked.length} booked, ${free.length} free)`)
    console.log('  Clients with 1 booking:', clients[0].email, ',', clients[1].email)
    console.log('  Clients with 0 bookings:', clients[2].email, ',', clients[3].email, ',', clients[4].email)
  } catch (error) {
    console.error(error.response?.data ?? error.message ?? error)
  }
}

runTests()
