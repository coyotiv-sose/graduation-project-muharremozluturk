const request = require('supertest');
const Client = require('../src/models/client');
const Expert = require('../src/models/expert');
const Session = require('../src/models/session');

const app = require('../src/app');

describe('App', () => {
    beforeEach(async () => {
        await Client.deleteMany();
        await Expert.deleteMany();
        await Session.deleteMany();
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
            hourlyRate
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

        const response = await request(app).post('/clients').send(expectedOutput);
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
            hourlyRate
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
            phone
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
            hourlyRate
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
            hourlyRate
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
            phone
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
            phone
        });

        const response = await request(app).get(`/clients/${responseClient.body._id}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(responseClient.body._id);
    });

    it('should create a new session', async () => {
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
            hourlyRate
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
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

        const response = await request(app).post('/sessions').send(sessionBody);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBeDefined();
    });

    it('should get sessions', async () => {
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
            hourlyRate
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseSession = await request(app).post('/sessions').send(sessionBody);

        const response = await request(app).get('/sessions');
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]._id).toBe(responseSession.body._id);
    });

    it('should get a session', async () => {
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
            hourlyRate
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
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

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;
        const response = await request(app).get(`/sessions/${sessionId}`);
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(sessionId);
    });

    it('should send an error if session id is not a valid object id', async () => {
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
            hourlyRate
        });

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
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

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;
        const response = await request(app).get(`/sessions/${sessionId}1234567890`);
        expect(response.status).toBe(404);
    });

    it('should send an error if session does not exist', async () => {
        const response = await request(app).get(`/sessions/1234567890`);
        expect(response.status).toBe(404);
    });

    it('should book a session', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            nameExpert,
            emailExpert,
            phoneExpert,
            specializationExpert,
            hourlyRateExpert
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;

        const clientBody = {
            nameClient,
            emailClient,
            phoneClient
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const response = await request(app).post(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });

        const expectedOutput = {
            startTime,
            endTime,
            availability: 'booked',
            client: {
                _id: responseClient.body._id
            }
        };
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject(expectedOutput);
        expect(response.body._id).toBe(sessionId);
    });

    it('should send an error when booking a session if session  is already booked', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const nameClient2 = 'Test Client 2';
        const emailClient2 = 'testclient2@example.com';
        const phoneClient2 = '+1234567823';

        const expertBody = {
            nameExpert,
            emailExpert,
            phoneExpert,
            specializationExpert,
            hourlyRateExpert
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;

        const clientBody = {
            nameClient,
            emailClient,
            phoneClient
        };

        const clientBody2 = {
            nameClient2,
            emailClient2,
            phoneClient2
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const responseBooking = await request(app).post(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });

        const response = await request(app).post(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });
        
        expect(response.status).toBe(400);
        expect(response.body).toBe('Session is not bookable.');
    });
    
    it('should cancel a booking of a session', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            nameExpert,
            emailExpert,
            phoneExpert,
            specializationExpert,
            hourlyRateExpert
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;

        const clientBody = {
            nameClient,
            emailClient,
            phoneClient
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const responseBooking = await request(app).post(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });

        const response = await request(app).delete(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });

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
        expect(response.body._id).toBe(sessionId);
    });

    it('should delete a session', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            nameExpert,
            emailExpert,
            phoneExpert,
            specializationExpert,
            hourlyRateExpert
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;

        const clientBody = {
            nameClient,
            emailClient,
            phoneClient
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const responseBooking = await request(app).post(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });

        const response = await request(app).delete(`/sessions/${sessionId}`).send({
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
        expect(response.body._id).toBe(sessionId);
    });

    it('should send an error when deleting a session that is cancelled', async () => {
        const nameExpert = 'Dr. Test Expert';
        const emailExpert = 'test@example.com';
        const phoneExpert = '+1234567899';
        const specializationExpert = 'Testing';
        const hourlyRateExpert = 150;

        const nameClient = 'Test Client';
        const emailClient = 'testclient@example.com';
        const phoneClient = '+1234567898';

        const expertBody = {
            nameExpert,
            emailExpert,
            phoneExpert,
            specializationExpert,
            hourlyRateExpert
        };

        const responseExpert = await request(app).post('/experts').send(expertBody);

        const startTime = new Date('2026-02-02T10:00:00').toISOString();
        const endTime = new Date('2026-02-02T11:00:00').toISOString();

        const sessionBody = {
            startTime,
            endTime,
            availability: 'free',
            expert: responseExpert.body._id
        };

        const responseSession = await request(app).post('/sessions').send(sessionBody);
        const sessionId = responseSession.body._id;

        const clientBody = {
            nameClient,
            emailClient,
            phoneClient
        };

        const responseClient = await request(app).post('/clients').send(clientBody);

        const responseBooking = await request(app).post(`/sessions/${sessionId}/client`).send({
            client: responseClient.body._id
        });

        const responseDelete = await request(app).delete(`/sessions/${sessionId}`).send({
            expert: responseExpert.body._id
        });

        const responseDeleteAgain = await request(app).delete(`/sessions/${sessionId}`).send({
            expert: responseExpert.body._id
        });

        expect(responseDeleteAgain.status).toBe(400);
        expect(responseDeleteAgain.body).toBe('Session is cancelled');
    });
    
    
});