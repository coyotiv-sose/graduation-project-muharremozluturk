const request = require('supertest')
const Client = require('../src/models/client')
const Expert = require('../src/models/expert')
const Appointment = require('../src/models/appointment')
const Review = require('../src/models/review')
const app = require('../src/app')

const TEST_PASSWORD = 'TestPassword1!'

describe('Reviews, notes, and profile APIs', () => {
    beforeEach(async () => {
        await Client.deleteMany()
        await Expert.deleteMany()
        await Appointment.deleteMany()
        await Review.deleteMany()
    })

    it('lets a client create and update a review on a completed appointment', async () => {
        const expertRes = await request(app).post('/experts').send({
            name: 'Dr. Review',
            email: `rev-expert-${Date.now()}@test.com`,
            phone: '+1',
            specialization: 'S',
            hourlyRate: 100,
            password: TEST_PASSWORD,
        })
        const clientRes = await request(app).post('/clients').send({
            name: 'Client Rev',
            email: `rev-client-${Date.now()}@test.com`,
            phone: '+2',
            password: TEST_PASSWORD,
        })
        const pastStart = new Date('2020-01-10T10:00:00.000Z')
        const pastEnd = new Date('2020-01-10T11:00:00.000Z')
        const appt = await Appointment.create({
            expert: expertRes.body._id,
            client: clientRes.body._id,
            startTime: pastStart,
            endTime: pastEnd,
            availability: 'booked',
        })
        await Expert.findByIdAndUpdate(expertRes.body._id, { $push: { appointments: appt._id } })

        const agent = request.agent(app)
        await agent.post('/accounts/session?role=client').send({
            email: clientRes.body.email,
            password: TEST_PASSWORD,
        })

        const create = await agent.post(`/appointments/${appt._id}/review`).send({
            rating: 5,
            text: 'Great session',
        })
        expect(create.status).toBe(201)
        expect(create.body.rating).toBe(5)
        expect(create.body.text).toBe('Great session')

        const upd = await agent.put(`/appointments/${appt._id}/review`).send({
            rating: 4,
            text: 'Updated',
        })
        expect(upd.status).toBe(200)
        expect(upd.body.rating).toBe(4)

        const expertGet = await request(app).get(`/experts/${expertRes.body._id}`)
        expect(expertGet.status).toBe(200)
        expect(expertGet.body.reviewCount).toBe(1)
        expect(expertGet.body.averageRating).toBe(4)
    })

    it('lets an expert set notes and returns expert GET with rating stats', async () => {
        const expertRes = await request(app).post('/experts').send({
            name: 'Dr. Notes',
            email: `notes-expert-${Date.now()}@test.com`,
            phone: '+1',
            specialization: 'S',
            hourlyRate: 50,
            password: TEST_PASSWORD,
        })
        const pastStart = new Date('2019-05-05T10:00:00.000Z')
        const pastEnd = new Date('2019-05-05T11:00:00.000Z')
        const appt = await Appointment.create({
            expert: expertRes.body._id,
            startTime: pastStart,
            endTime: pastEnd,
            availability: 'free',
        })

        const agent = request.agent(app)
        await agent.post('/accounts/session?role=expert').send({
            email: expertRes.body.email,
            password: TEST_PASSWORD,
        })

        const put = await agent.put(`/appointments/${appt._id}/notes`).send({
            notes: 'Follow-up next week',
        })
        expect(put.status).toBe(200)
        expect(put.body.expertNotes).toBe('Follow-up next week')

        const list = await request(app).get(`/experts/${expertRes.body._id}`)
        expect(list.body.averageRating).toBeNull()
        expect(list.body.reviewCount).toBe(0)
    })

    it('exposes upcoming and completed lists for the session client', async () => {
        const expertRes = await request(app).post('/experts').send({
            name: 'Dr. Lists',
            email: `list-expert-${Date.now()}@test.com`,
            phone: '+1',
            specialization: 'S',
            hourlyRate: 80,
            password: TEST_PASSWORD,
        })
        const clientRes = await request(app).post('/clients').send({
            name: 'List Client',
            email: `list-client-${Date.now()}@test.com`,
            phone: '+2',
            password: TEST_PASSWORD,
        })
        const futureStart = new Date('2035-06-01T10:00:00.000Z')
        const futureEnd = new Date('2035-06-01T11:00:00.000Z')
        await Appointment.create({
            expert: expertRes.body._id,
            client: clientRes.body._id,
            startTime: futureStart,
            endTime: futureEnd,
            availability: 'booked',
        })
        const pastStart = new Date('2018-01-01T10:00:00.000Z')
        const pastEnd = new Date('2018-01-01T11:00:00.000Z')
        await Appointment.create({
            expert: expertRes.body._id,
            client: clientRes.body._id,
            startTime: pastStart,
            endTime: pastEnd,
            availability: 'completed',
        })

        const agent = request.agent(app)
        await agent.post('/accounts/session?role=client').send({
            email: clientRes.body.email,
            password: TEST_PASSWORD,
        })

        const up = await agent.get(`/clients/${clientRes.body._id}/upcoming-appointments`)
        expect(up.status).toBe(200)
        expect(up.body.length).toBe(1)

        const done = await agent.get(`/clients/${clientRes.body._id}/completed-appointments`)
        expect(done.status).toBe(200)
        expect(done.body.length).toBe(1)
    })

    it('PATCH client profile updates name for logged-in client', async () => {
        const clientRes = await request(app).post('/clients').send({
            name: 'Before',
            email: `patch-client-${Date.now()}@test.com`,
            phone: '+1',
            password: TEST_PASSWORD,
        })
        const agent = request.agent(app)
        await agent.post('/accounts/session?role=client').send({
            email: clientRes.body.email,
            password: TEST_PASSWORD,
        })
        const res = await agent.patch(`/clients/${clientRes.body._id}`).send({ name: 'After' })
        expect(res.status).toBe(200)
        expect(res.body.name).toBe('After')
    })

    it('PATCH expert profile updates specialization and hourly rate', async () => {
        const expertRes = await request(app).post('/experts').send({
            name: 'Patch',
            email: `patch-expert-${Date.now()}@test.com`,
            phone: '+1',
            specialization: 'Old',
            hourlyRate: 10,
            password: TEST_PASSWORD,
        })
        const agent = request.agent(app)
        await agent.post('/accounts/session?role=expert').send({
            email: expertRes.body.email,
            password: TEST_PASSWORD,
        })
        const res = await agent.patch(`/experts/${expertRes.body._id}`).send({
            specialization: 'NewSpec',
            hourlyRate: 99,
        })
        expect(res.status).toBe(200)
        expect(res.body.specialization).toBe('NewSpec')
        expect(res.body.hourlyRate).toBe(99)
    })
})
