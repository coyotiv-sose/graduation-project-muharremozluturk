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

    // const postClientResponse = await api.post('/clients', {
    //   name: 'Test Client',
    //   email: 'testclient@example.com',
    //   phone: '+1234567898'
    // });
    // console.log('POST /clients');
    // console.log(postClientResponse.data);

    const getExpertsResponse = await api.get('/experts');
    console.log('GET /experts');
    console.log(getExpertsResponse.data);

    const getExpertWithIdResponse = await api.get(`/experts/${postExpertResponse.data._id}`);
    console.log('GET /experts/:expertId');
    console.log(getExpertWithIdResponse.data);

    // const getClientsResponse = await api.get('/clients');
    // console.log('GET /clients');
    // console.log(getClientsResponse.data);

    // const getClientResponse = await api.get(`/clients/${postClientResponse.data._id}`);
    // console.log('GET /clients/:clientId');
    // console.log(getClientResponse.data);

    // const postSessionResponse = await api.post('/experts/561e6ad3dd/sessions', {
    //   startTime: '2026-02-02T10:00:00',
    //   endTime: '2026-02-02T11:00:00',
    //   status: 'free'
    // });
    // console.log('POST /experts/:expertId/sessions');
    // console.log(postSessionResponse.data);

    // const getSessionsResponse = await api.get('/experts/561e6ad3dd/sessions');
    // console.log('GET /experts/:expertId/sessions');
    // console.log(getSessionsResponse.data);

    // const postParticipantResponse = await api.post('/clients/db6f68b3ff/sessions/60c7f93983/participants');
    // console.log('POST /clients/:clientId/sessions/:sessionId/participants');
    // console.log(postParticipantResponse.data);
  }
  catch (error) {
    console.error(error);
  }
}

runTests();
