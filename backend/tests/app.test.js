const request = require('supertest');
const Client = require('../src/models/client');
const Expert = require('../src/models/expert');
const Appointment = require('../src/models/appointment');

const app = require('../src/app');

const TEST_PASSWORD = 'TestPassword1!';

describe('App', () => {
    beforeEach(async () => {
        await Client.deleteMany();
        await Expert.deleteMany();
        await Appointment.deleteMany();
    });


    it('should return a 200 status code', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('should create a new expert', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const expectedOutput = {
            name,
            email,
            phone,
            specialization,
            hourlyRate
        };

        const response = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBeDefined();
    });

    it('should create a new client', async () => {
        const name = 'Test Client';
        const email = 'testclient@example.com';
        const phone = '+1234567898';

        const expectedOutput = {
            name,
            email,
            phone
        };

        const response = await request(app).post('/clients').send({
            ...expectedOutput,
            password: TEST_PASSWORD,
        });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBeDefined();
    });

    it('should get all experts', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        const response = await request(app).get('/experts');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get all clients', async () => {
        const name = 'Test Client';
        const email = 'testclient@example.com';
        const phone = '+1234567898';

        const responseClient = await request(app).post('/clients').send({
            name,
            email,
            phone,
            password: TEST_PASSWORD,
        });

        const response = await request(app).get('/clients');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should get an expert', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;
        const expectedOutput = {
            name,
            email,
            phone,
            specialization,
            hourlyRate
        };

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        const response = await request(app).get(`/experts/${responseExpert.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(responseExpert.body._id);
    });

    it('should send an error if no expert exists', async () => {
        const response = await request(app).get(`/experts/1234567890`);
        expect(response.status).toBe(404);
        expect(response.body).toBe('Expert not found');
    });

    it('should send an error if no client exists', async () => {
        const response = await request(app).get(`/clients/1234567890`);
        expect(response.status).toBe(404);
        expect(response.body).toBe('Client not found');
    });

    it('should send an error if expert id is not a valid object id', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });
        const response = await request(app).get(`/experts/${responseExpert.body._id}1234567890`);
        expect(response.status).toBe(404);
        expect(response.body).toBe('Expert not found');
    }); 

    it('should send an error if client id is not a valid object id', async () => {
        const name = 'Test Client';
        const email = 'testclient@example.com';
        const phone = '+1234567898';

        const responseClient = await request(app).post('/clients').send({
            name,
            email,
            phone,
            password: TEST_PASSWORD,
        });
        const response = await request(app).get(`/clients/${responseClient.body._id}1234567890`);
        expect(response.status).toBe(404);
        expect(response.body).toBe('Client not found');
    });

    it('should get a client', async () => {
        const name = 'Test Client';
        const email = 'testclient@example.com';
        const phone = '+1234567898';
        const expectedOutput = {
            name,
            email,
            phone
        };

        const responseClient = await request(app).post('/clients').send({
            name,
            email,
            phone,
            password: TEST_PASSWORD,
        });

        const response = await request(app).get(`/clients/${responseClient.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(responseClient.body._id);
    });

    it('should create a new appointment', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'free',
            expert: {
                _id: responseExpert.body._id
            }
        };

        const response = await request(app).post('/appointments').send(appointmentBody);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBeDefined();
    });

    it('should get appointments', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);

        const response = await request(app).get('/appointments');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        const ids = response.body.map((a) => a._id);
        expect(ids).toContain(responseAppointment.body._id);
    });

    it('should get an appointment', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'free',
            expert: {
                _id: responseExpert.body._id
            }
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;
        const response = await request(app).get(`/appointments/${appointmentId}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(appointmentId);
    });

    it('should send an error if appointment id is not a valid object id', async () => {
        const name = 'Dr. Test Expert';
        const email = 'test@example.com';
        const phone = '+1234567899';
        const specialization = 'Testing';
        const hourlyRate = 150;

        const responseExpert = await request(app).post('/experts').send({
            name,
            email,
            phone,
            specialization,
            hourlyRate,
            password: TEST_PASSWORD,
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'free',
            expert: {
                _id: responseExpert.body._id
            }
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;
        const response = await request(app).get(`/appointments/${appointmentId}1234567890`);
        expect(response.status).toBe(404);
    });

    it('should send an error if appointment does not exist', async () => {
        const response = await request(app).get(`/appointments/1234567890`);
        expect(response.status).toBe(404);
    });

    it('should book an appointment', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            name: nameExpert,
            email: emailExpert,
            phone: phoneExpert,
            specialization: specializationExpert,
            hourlyRate: hourlyRateExpert,
            password: TEST_PASSWORD,
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;

        const clientBody = {
            name: nameClient,
            email: emailClient,
            phone: phoneClient,
            password: TEST_PASSWORD,
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const agent = request.agent(app);
        await agent.post('/accounts/session?role=client').send({
            email: emailClient,
            password: TEST_PASSWORD,
        });

        const response = await agent.post(`/appointments/${appointmentId}/client`).send({});

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'booked',
            client: {
                _id: responseClient.body._id,
            },
        };
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(appointmentId);
    });

    it('GET /appointments omits client for bookings that are not the session client', async () => {
        const expertBody = {
            name: 'Dr. Privacy Expert',
            email: 'privacy-expert@example.com',
            phone: '+1999000111',
            specialization: 'Privacy',
            hourlyRate: 100,
            password: TEST_PASSWORD,
        };
        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-03-01T10:00:00').toISOString();
        const endTime = new Date('2026-03-01T11:00:00').toISOString();

        const responseAppointment = await request(app)
            .post('/appointments')
            .send({
                startTime,
                endTime,
                availability: 'free',
                expert: responseExpert.body._id,
            });

        const clientABody = {
            name: 'Client A',
            email: 'client-a@example.com',
            phone: '+1999000222',
            password: TEST_PASSWORD,
        };
        const clientBBody = {
            name: 'Client B',
            email: 'client-b@example.com',
            phone: '+1999000333',
            password: TEST_PASSWORD,
        };
        const responseClientA = await request(app).post('/clients').send(clientABody);
        const responseClientB = await request(app).post('/clients').send(clientBBody);

        const agentA = request.agent(app);
        await agentA.post('/accounts/session?role=client').send({
            email: clientABody.email,
            password: TEST_PASSWORD,
        });
        await agentA.post(`/appointments/${responseAppointment.body._id}/client`).send({});

        const agentB = request.agent(app);
        await agentB.post('/accounts/session?role=client').send({
            email: clientBBody.email,
            password: TEST_PASSWORD,
        });

        const list = await agentB.get('/appointments');
        expect(list.status).toBe(200);
        const booked = list.body.find((a) => a._id === responseAppointment.body._id);
        expect(booked).toBeDefined();
        expect(booked.availability).toBe('booked');
        expect(booked.client).toBeUndefined();
    });

    it('should send an error when booking an appointment if it is already booked', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            name: nameExpert,
            email: emailExpert,
            phone: phoneExpert,
            specialization: specializationExpert,
            hourlyRate: hourlyRateExpert,
            password: TEST_PASSWORD,
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;

        const clientBody = {
            name: nameClient,
            email: emailClient,
            phone: phoneClient,
            password: TEST_PASSWORD,
        };

        await request(app).post('/clients').send(clientBody);

        const agent = request.agent(app);
        await agent.post('/accounts/session?role=client').send({
            email: emailClient,
            password: TEST_PASSWORD,
        });

        await agent.post(`/appointments/${appointmentId}/client`).send({});

        const response = await agent.post(`/appointments/${appointmentId}/client`).send({});

        expect(response.status).toBe(400);
        expect(response.body).toBe('Appointment is not bookable.');
    });

    it('should cancel a booking of an appointment', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            name: nameExpert,
            email: emailExpert,
            phone: phoneExpert,
            specialization: specializationExpert,
            hourlyRate: hourlyRateExpert,
            password: TEST_PASSWORD,
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;

        const clientBody = {
            name: nameClient,
            email: emailClient,
            phone: phoneClient,
            password: TEST_PASSWORD,
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const agent = request.agent(app);
        await agent.post('/accounts/session?role=client').send({
            email: emailClient,
            password: TEST_PASSWORD,
        });

        await agent.post(`/appointments/${appointmentId}/client`).send({});

        const response = await agent.delete(`/appointments/${appointmentId}/client`);

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'free',
            expert: {
                _id: responseExpert.body._id
            }
        };
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(appointmentId);
    });

    it('should reject cancel booking when the session client is not the booker', async () => {
        const expertBody = {
            name: 'Dr. Cancel Guard Expert',
            email: 'cancel-guard-expert@example.com',
            phone: '+1999000444',
            specialization: 'Testing',
            hourlyRate: 120,
            password: TEST_PASSWORD,
        };
        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-04-01T10:00:00').toISOString();
        const endTime = new Date('2026-04-01T11:00:00').toISOString();

        const responseAppointment = await request(app).post('/appointments').send({
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id,
        });

        const clientA = await request(app).post('/clients').send({
            name: 'Owner Client',
            email: 'owner-cancel-test@example.com',
            phone: '+1999000555',
            password: TEST_PASSWORD,
        });
        const clientB = await request(app).post('/clients').send({
            name: 'Other Client',
            email: 'other-cancel-test@example.com',
            phone: '+1999000666',
            password: TEST_PASSWORD,
        });

        const agentA = request.agent(app);
        await agentA.post('/accounts/session?role=client').send({
            email: 'owner-cancel-test@example.com',
            password: TEST_PASSWORD,
        });
        await agentA.post(`/appointments/${responseAppointment.body._id}/client`).send({});

        const agentB = request.agent(app);
        await agentB.post('/accounts/session?role=client').send({
            email: 'other-cancel-test@example.com',
            password: TEST_PASSWORD,
        });

        const res = await agentB.delete(`/appointments/${responseAppointment.body._id}/client`);
        expect(res.status).toBe(400);
        expect(res.body).toBe('You can only cancel your own booking.');
    });

    it('should delete an appointment', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            name: nameExpert,
            email: emailExpert,
            phone: phoneExpert,
            specialization: specializationExpert,
            hourlyRate: hourlyRateExpert,
            password: TEST_PASSWORD,
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;

        const clientBody = {
            name: nameClient,
            email: emailClient,
            phone: phoneClient,
            password: TEST_PASSWORD,
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const agent = request.agent(app);
        await agent.post('/accounts/session?role=client').send({
            email: emailClient,
            password: TEST_PASSWORD,
        });
        await agent.post(`/appointments/${appointmentId}/client`).send({});

        const response = await request(app).delete(`/appointments/${appointmentId}`).send({
            expert: responseExpert.body._id
        });

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'cancelled',
            expert: {
                _id: responseExpert.body._id
            }
        };
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(appointmentId);
    });

    it('should send an error when deleting an appointment that is cancelled', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            name: nameExpert,
            email: emailExpert,
            phone: phoneExpert,
            specialization: specializationExpert,
            hourlyRate: hourlyRateExpert,
            password: TEST_PASSWORD,
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const appointmentBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseAppointment = await request(app).post('/appointments').send(appointmentBody);
        const appointmentId = responseAppointment.body._id;

        const clientBody = {
            name: nameClient,
            email: emailClient,
            phone: phoneClient,
            password: TEST_PASSWORD,
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const agent = request.agent(app);
        await agent.post('/accounts/session?role=client').send({
            email: emailClient,
            password: TEST_PASSWORD,
        });
        await agent.post(`/appointments/${appointmentId}/client`).send({});

        const responseDelete = await request(app).delete(`/appointments/${appointmentId}`).send({
            expert: responseExpert.body._id
        });

        const responseDeleteAgain = await request(app).delete(`/appointments/${appointmentId}`).send({
            expert: responseExpert.body._id
        });

        expect(responseDeleteAgain.status).toBe(400);
        expect(responseDeleteAgain.body).toBe('Appointment is cancelled');
    });

    describe('Appointments API guards and errors', () => {
        const missingApptId = '507f191e810c19729de860ea';

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('POST book returns 401 when not logged in', async () => {
            const res = await request(app).post(`/appointments/${missingApptId}/client`).send({});
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Login required');
        });

        it('POST book returns 403 when logged in as expert', async () => {
            await request(app).post('/experts').send({
                name: 'Book Guard Expert',
                email: 'book-guard-expert@test.com',
                phone: '+1999111222',
                specialization: 'S',
                hourlyRate: 1,
                password: TEST_PASSWORD,
            });
            const agent = request.agent(app);
            await agent.post('/accounts/session?role=expert').send({
                email: 'book-guard-expert@test.com',
                password: TEST_PASSWORD,
            });
            const res = await agent.post(`/appointments/${missingApptId}/client`).send({});
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Only clients can book appointments');
        });

        it('POST book returns 404 when appointment does not exist', async () => {
            await request(app).post('/clients').send({
                name: 'C',
                email: 'book-404-client@test.com',
                phone: '+1999111333',
                password: TEST_PASSWORD,
            });
            const agent = request.agent(app);
            await agent.post('/accounts/session?role=client').send({
                email: 'book-404-client@test.com',
                password: TEST_PASSWORD,
            });
            const res = await agent.post(`/appointments/${missingApptId}/client`).send({});
            expect(res.status).toBe(404);
            expect(res.body).toBe('Appointment not found');
        });

        it('DELETE cancel returns 401 when not logged in', async () => {
            const res = await request(app).delete(`/appointments/${missingApptId}/client`);
            expect(res.status).toBe(401);
            expect(res.body.error).toBe('Login required');
        });

        it('DELETE cancel returns 403 when logged in as expert', async () => {
            await request(app).post('/experts').send({
                name: 'Cancel Guard Expert',
                email: 'cancel-guard-expert@test.com',
                phone: '+1999111444',
                specialization: 'S',
                hourlyRate: 1,
                password: TEST_PASSWORD,
            });
            const agent = request.agent(app);
            await agent.post('/accounts/session?role=expert').send({
                email: 'cancel-guard-expert@test.com',
                password: TEST_PASSWORD,
            });
            const res = await agent.delete(`/appointments/${missingApptId}/client`);
            expect(res.status).toBe(403);
            expect(res.body.error).toBe('Only clients can cancel bookings');
        });

        it('DELETE cancel returns 404 when appointment does not exist', async () => {
            await request(app).post('/clients').send({
                name: 'C',
                email: 'cancel-404-client@test.com',
                phone: '+1999111555',
                password: TEST_PASSWORD,
            });
            const agent = request.agent(app);
            await agent.post('/accounts/session?role=client').send({
                email: 'cancel-404-client@test.com',
                password: TEST_PASSWORD,
            });
            const res = await agent.delete(`/appointments/${missingApptId}/client`);
            expect(res.status).toBe(404);
            expect(res.body).toBe('Appointment not found');
        });

        it('POST /appointments forwards to error handler when expert is missing', async () => {
            const res = await request(app).post('/appointments').send({
                startTime: new Date('2026-06-01T10:00:00').toISOString(),
                endTime: new Date('2026-06-01T11:00:00').toISOString(),
            });
            expect(res.status).toBe(500);
        });

        it('GET /appointments forwards errors from Appointment.find', async () => {
            jest.spyOn(Appointment, 'find').mockRejectedValueOnce(new Error('simulated failure'));
            const res = await request(app).get('/appointments');
            expect(res.status).toBe(500);
        });

        it('GET /appointments/:id forwards errors from Appointment.findById', async () => {
            jest.spyOn(Appointment, 'findById').mockRejectedValueOnce(new Error('simulated failure'));
            const res = await request(app).get(`/appointments/${missingApptId}`);
            expect(res.status).toBe(500);
        });
    });

    describe('accounts routes', () => {
        const accounts = require('../src/routes/accounts');
        const passport = require('passport');

        describe('exported helpers', () => {
            it('requestedRole reads query first, then body, only client|expert', () => {
                expect(accounts.requestedRole({ query: { role: 'client' }, body: {} })).toBe('client');
                expect(accounts.requestedRole({ query: {}, body: { role: 'expert' } })).toBe('expert');
                expect(accounts.requestedRole({ query: { role: 'expert' }, body: { role: 'client' } })).toBe(
                    'expert',
                );
                expect(accounts.requestedRole({ query: { role: 'admin' }, body: {} })).toBeNull();
                expect(accounts.requestedRole({ query: {}, body: {} })).toBeNull();
            });

            it('roleOfUser handles Client, Expert, and unsupported types', () => {
                expect(accounts.roleOfUser(null)).toBeNull();
                expect(accounts.roleOfUser({})).toBeNull();
                expect(accounts.roleOfUser({ constructor: { modelName: 'Other' } })).toBeNull();
            });

            it('toSessionUser returns null for missing user', () => {
                expect(accounts.toSessionUser(null)).toBeNull();
            });

            it('toSessionUser supports plain objects without toObject', () => {
                const plain = {
                    email: 'p@test.com',
                    constructor: { modelName: 'Expert' },
                    hash: 'x',
                    salt: 'y',
                };
                expect(accounts.toSessionUser(plain)).toEqual({ role: 'expert' });
            });

            it('toSessionUser strips hash and salt from mongoose documents', async () => {
                const email = `mongoose-sess-${Date.now()}@test.com`;
                const doc = await Client.register({ name: 'N', email, phone: '1' }, TEST_PASSWORD);
                const out = accounts.toSessionUser(doc);
                expect(out.role).toBe('client');
                expect(out.hash).toBeUndefined();
                expect(out.salt).toBeUndefined();
                expect(out.email).toBe(email);
            });
        });

        describe('/accounts/session HTTP', () => {
            it('GET session when not logged in returns null', async () => {
                const res = await request(app).get('/accounts/session');
                expect(res.status).toBe(200);
                expect(res.body).toBeNull();
            });

            it('logs in client via query role, returns user with role and clears session on logout', async () => {
                const email = `acc-client-${Date.now()}@test.com`;
                const agent = request.agent(app);
                await agent.post('/clients').send({
                    name: 'Acc Client',
                    email,
                    phone: '+10000000001',
                    password: TEST_PASSWORD,
                });
                const login = await agent
                    .post('/accounts/session?role=client')
                    .send({ email, password: TEST_PASSWORD });
                expect(login.status).toBe(200);
                expect(login.body.role).toBe('client');
                expect(login.body.hash).toBeUndefined();
                expect(login.body.email).toBe(email);

                const me = await agent.get('/accounts/session');
                expect(me.body.role).toBe('client');

                const wrongRole = await agent.get('/accounts/session?role=expert');
                expect(wrongRole.status).toBe(403);
                expect(wrongRole.body.error).toBeDefined();

                const okRole = await agent.get('/accounts/session?role=client');
                expect(okRole.status).toBe(200);

                await agent.delete('/accounts/session').expect(200);

                const after = await agent.get('/accounts/session');
                expect(after.body).toBeNull();
            });

            it('logs in client with role only in JSON body', async () => {
                const email = `acc-body-${Date.now()}@test.com`;
                const agent = request.agent(app);
                await agent.post('/clients').send({
                    name: 'Body Client',
                    email,
                    phone: '+10000000002',
                    password: TEST_PASSWORD,
                });
                const login = await agent.post('/accounts/session').send({
                    role: 'client',
                    email,
                    password: TEST_PASSWORD,
                });
                expect(login.status).toBe(200);
                expect(login.body.role).toBe('client');
            });

            it('logs in expert via role=expert', async () => {
                const email = `acc-expert-${Date.now()}@test.com`;
                const agent = request.agent(app);
                await agent.post('/experts').send({
                    name: 'Acc Expert',
                    email,
                    phone: '+10000000003',
                    specialization: 'S',
                    hourlyRate: 1,
                    password: TEST_PASSWORD,
                });
                const login = await agent
                    .post('/accounts/session?role=expert')
                    .send({ email, password: TEST_PASSWORD });
                expect(login.status).toBe(200);
                expect(login.body.role).toBe('expert');
            });

            it('POST session rejects missing role', async () => {
                const res = await request(app).post('/accounts/session').send({
                    email: 'x@y.com',
                    password: 'nop',
                });
                expect(res.status).toBe(400);
                expect(res.body.error).toContain('Missing role');
            });

            it('POST session rejects invalid role value', async () => {
                const res = await request(app).post('/accounts/session?role=admin').send({
                    email: 'x@y.com',
                    password: 'nop',
                });
                expect(res.status).toBe(400);
            });

            it('POST session returns 401 for wrong password', async () => {
                const email = `bad-pw-${Date.now()}@test.com`;
                await request(app).post('/clients').send({
                    name: 'Bad',
                    email,
                    phone: '+1',
                    password: TEST_PASSWORD,
                });
                const res = await request(app).post('/accounts/session?role=client').send({
                    email,
                    password: 'wrong-password',
                });
                expect(res.status).toBe(401);
                expect(res.body.error).toBe('Invalid credentials');
            });

            it('GET session ignores invalid role query and still returns user when logged in', async () => {
                const email = `invalid-role-query-${Date.now()}@test.com`;
                const agent = request.agent(app);
                await agent.post('/clients').send({
                    name: 'X',
                    email,
                    phone: '+1',
                    password: TEST_PASSWORD,
                });
                await agent.post('/accounts/session?role=client').send({ email, password: TEST_PASSWORD });
                const res = await agent.get('/accounts/session?role=not-a-role');
                expect(res.status).toBe(200);
                expect(res.body.role).toBe('client');
            });

            it('POST session invokes authenticate callback with err and forwards to next', async () => {
                const orig = passport.authenticate;
                passport.authenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
                    callback(new Error('simulated strategy error'));
                });
                try {
                    const res = await request(app)
                        .post('/accounts/session?role=client')
                        .send({ email: 'any@test.com', password: 'x' });
                    expect(res.status).toBe(500);
                } finally {
                    passport.authenticate = orig;
                }
            });

            it('POST session returns 401 when authenticate yields no user', async () => {
                const orig = passport.authenticate;
                passport.authenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
                    callback(null, false);
                });
                try {
                    const res = await request(app)
                        .post('/accounts/session?role=client')
                        .send({ email: 'any@test.com', password: 'x' });
                    expect(res.status).toBe(401);
                } finally {
                    passport.authenticate = orig;
                }
            });

            it('POST session forwards logIn errors to next', async () => {
                const orig = passport.authenticate;
                passport.authenticate = jest.fn((strategy, options, callback) => (req, res, next) => {
                    const fakeUser = {
                        id: '507f1f77bcf86cd799439011',
                        constructor: { modelName: 'Client' },
                        toObject() {
                            return { email: 'fake@test.com' };
                        },
                    };
                    req.logIn = (u, cb) => cb(new Error('logIn blocked'));
                    callback(null, fakeUser);
                });
                try {
                    const res = await request(app)
                        .post('/accounts/session?role=client')
                        .send({ email: 'any@test.com', password: TEST_PASSWORD });
                    expect(res.status).toBe(500);
                } finally {
                    passport.authenticate = orig;
                }
            });

            it('DELETE session forwards logout callback errors to next', async () => {
                const deleteLayer = accounts.stack.find(
                    (layer) => layer.route && layer.route.path === '/session' && layer.route.methods.delete,
                );
                const origHandle = deleteLayer.handle;
                deleteLayer.handle = function patchedDeleteSession(req, res, next) {
                    req.logout = (cb) => cb(new Error('forced logout error'));
                    return origHandle.call(this, req, res, next);
                };
                try {
                    const res = await request(app).delete('/accounts/session');
                    expect(res.status).toBe(500);
                } finally {
                    deleteLayer.handle = origHandle;
                }
            });
        });
    });
});