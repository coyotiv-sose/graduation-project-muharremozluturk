const {
    sanitizeAppointmentForRequest,
    roleOfUser,
} = require('../src/utils/appointmentResponse');

describe('roleOfUser', () => {
    it('returns null for missing or invalid user', () => {
        expect(roleOfUser(null)).toBeNull();
        expect(roleOfUser(undefined)).toBeNull();
        expect(roleOfUser({})).toBeNull();
        expect(roleOfUser({ _id: 'x' })).toBeNull();
    });

    it('returns client or expert based on modelName', () => {
        expect(roleOfUser({ constructor: { modelName: 'Client' } })).toBe('client');
        expect(roleOfUser({ constructor: { modelName: 'Expert' } })).toBe('expert');
        expect(roleOfUser({ constructor: { modelName: 'Other' } })).toBeNull();
    });
});

describe('sanitizeAppointmentForRequest', () => {
    const clientId = '507f1f77bcf86cd799439011';
    const otherClientId = '507f191e810c19729de860ec';
    const expertOwnId = '507f191e810c19729de860ea';
    const otherExpertId = '507f191e810c19729de860eb';

    it('removes client for anonymous viewers when client is present', () => {
        const appointment = {
            _id: 'a1',
            startTime: new Date(),
            client: { _id: clientId, email: 'c@test.com', hash: 'h', salt: 's' },
            expert: expertOwnId,
        };
        const out = sanitizeAppointmentForRequest(appointment, { user: undefined });
        expect(out.client).toBeUndefined();
        expect(out.expert).toBe(expertOwnId);
    });

    it('leaves plain objects without client key unchanged regarding client', () => {
        const appointment = { expert: expertOwnId, availability: 'free' };
        const out = sanitizeAppointmentForRequest(appointment, {});
        expect(out.client).toBeUndefined();
    });

    it('for client viewer strips client when appointment is booked by someone else', () => {
        const user = { _id: clientId, constructor: { modelName: 'Client' } };
        const appointment = {
            client: { _id: otherClientId },
            expert: expertOwnId,
        };
        const out = sanitizeAppointmentForRequest(appointment, { user });
        expect(out.client).toBeUndefined();
    });

    it('for client viewer keeps and sanitizes own booking client object', () => {
        const user = { _id: clientId, constructor: { modelName: 'Client' } };
        const appointment = {
            client: { _id: clientId, email: 'me@test.com', hash: 'secret', salt: 's' },
            expert: expertOwnId,
        };
        const out = sanitizeAppointmentForRequest(appointment, { user });
        expect(out.client._id).toBe(clientId);
        expect(out.client.email).toBe('me@test.com');
        expect(out.client.hash).toBeUndefined();
        expect(out.client.salt).toBeUndefined();
    });

    it('for expert viewer strips client on another experts appointment', () => {
        const user = { _id: expertOwnId, constructor: { modelName: 'Expert' } };
        const appointment = {
            expert: { _id: otherExpertId },
            client: { _id: clientId, name: 'X' },
        };
        const out = sanitizeAppointmentForRequest(appointment, { user });
        expect(out.client).toBeUndefined();
    });

    it('for expert viewer keeps and sanitizes client on own calendar', () => {
        const user = { _id: expertOwnId, constructor: { modelName: 'Expert' } };
        const appointment = {
            expert: { _id: expertOwnId },
            client: { _id: clientId, email: 'c@test.com', hash: 'h', salt: 's' },
        };
        const out = sanitizeAppointmentForRequest(appointment, { user });
        expect(out.client._id).toBe(clientId);
        expect(out.client.hash).toBeUndefined();
        expect(out.client.salt).toBeUndefined();
    });

    it('removes client for unsupported viewer role', () => {
        const user = { _id: 'x', constructor: { modelName: 'OtherModel' } };
        const appointment = {
            client: { _id: clientId },
            expert: expertOwnId,
        };
        const out = sanitizeAppointmentForRequest(appointment, { user });
        expect(out.client).toBeUndefined();
    });

    it('removes client when user has no constructor (invalid session shape)', () => {
        const appointment = {
            client: { _id: clientId },
            expert: expertOwnId,
        };
        const out = sanitizeAppointmentForRequest(appointment, { user: { _id: clientId } });
        expect(out.client).toBeUndefined();
    });

    it('sanitizeClientPublic returns non-objects as-is', () => {
        const user = { _id: clientId, constructor: { modelName: 'Client' } };
        const appointment = {
            client: clientId,
            expert: expertOwnId,
        };
        const out = sanitizeAppointmentForRequest(appointment, { user });
        expect(out.client).toBe(clientId);
    });

    it('supports mongoose-like documents with toObject', () => {
        const user = { _id: clientId, constructor: { modelName: 'Client' } };
        const doc = {
            toObject() {
                return {
                    client: { _id: clientId, email: 'm@test.com', hash: '1', salt: '2' },
                    expert: expertOwnId,
                };
            },
        };
        const out = sanitizeAppointmentForRequest(doc, { user });
        expect(out.client.email).toBe('m@test.com');
        expect(out.client.hash).toBeUndefined();
    });
});
