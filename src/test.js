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

    const getExpertWithIdResponse = await api.get(`/experts/${postExpertResponse.data._id}`);
    console.log('GET /experts/:expertId');
    console.log(getExpertWithIdResponse.data);

    const getClientsResponse = await api.get('/clients');
    console.log('GET /clients');
    console.log(getClientsResponse.data);

    const getClientResponse = await api.get(`/clients/${postClientResponse.data._id}`);
    console.log('GET /clients/:clientId');
    console.log(getClientResponse.data);

    const postSessionResponse = await api.post('/sessions', {
      startTime: new Date('2026-02-02T10:00:00'),
      endTime: new Date('2026-02-02T11:00:00'),
      availability: 'free',
      expert: getExpertWithIdResponse.data,
    });
    console.log('POST /sessions');
    console.log(postSessionResponse.data);

    const getSessionsResponse = await api.get('/sessions');
    console.log('GET /sessions');
    console.log(getSessionsResponse.data);

    const getSessionResponse = await api.get(`/sessions/${postSessionResponse.data._id}`);
    console.log('GET /sessions/:sessionId');
    console.log(getSessionResponse.data);

    const bookSessionResponse = await api.post(`/sessions/${postSessionResponse.data._id}/client`, {
      client: postClientResponse.data
    })
    console.log('POST /sessions/:sessionId/client');
    console.log(bookSessionResponse.data);

    // const cancelBookingResponse = await api.delete(`/sessions/${postSessionResponse.data._id}/client`, {
    //   data: {
    //     client: postClientResponse.data
    //   }})
    // console.log('DELETE /sessions/:sessionId/client');
    // console.log(cancelBookingResponse.data);

    const cancelSessionResponse = await api.delete(`/sessions/${postSessionResponse.data._id}`, {
      data: {
        expert: getExpertWithIdResponse.data
      }})
    console.log('DELETE /sessions/:sessionId');
    console.log(cancelSessionResponse.data);

  }
  catch (error) {
    console.error(error);
  }
}

runTests();
