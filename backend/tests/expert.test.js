const Client = require('../src/models/client');
const Expert = require('../src/models/expert');
const Appointment = require('../src/models/appointment');

require('../src/app');

describe('Expert model rescheduleAppointment', () => {
    beforeEach(async () => {
        await Client.deleteMany();
        await Expert.deleteMany();
        await Appointment.deleteMany();
    });

    async function createExpert(email) {
        return Expert.create({
            name: 'Expert',
            email,
            phone: '+1000000000',
            specialization: 'Testing',
            hourlyRate: 100,
        });
    }

    async function createClient(email) {
        return Client.create({
            name: 'Client',
            email,
            phone: '+2000000000',
        });
    }

    async function createAppointment(expertId, startTime, availability, clientId) {
        return Appointment.create({
            expert: expertId,
            startTime: new Date(startTime),
            endTime: new Date(new Date(startTime).getTime() + (60 * 60 * 1000)),
            availability,
            client: clientId,
        });
    }

    it('createAppointment rejects when end time is not after start time', async () => {
        const expert = await createExpert('invalid-time@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const startTime = new Date('2026-07-01T10:00:00.000Z');

        await expect(persistedExpert.createAppointment(startTime, startTime)).rejects.toThrow(
            'End time must be after start time',
        );
    });

    it('throws when one of the appointments is missing', async () => {
        const expert = await createExpert('missing-appointments@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const newAppointment = await createAppointment(
            expert._id,
            '2026-07-01T12:00:00.000Z',
            'free',
        );

        await expect(persistedExpert.rescheduleAppointment(null, newAppointment)).rejects.toThrow(
            'Both current and new appointments are required',
        );
    });

    it('throws when trying to reschedule to the same appointment', async () => {
        const expert = await createExpert('same-appointment@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const client = await createClient('same-appointment-client@test.com');
        const appointment = await createAppointment(
            expert._id,
            '2026-07-02T10:00:00.000Z',
            'booked',
            client._id,
        );

        await expect(persistedExpert.rescheduleAppointment(appointment, appointment)).rejects.toThrow(
            'Choose a different appointment to reschedule',
        );
    });

    it('throws when the current appointment belongs to another expert', async () => {
        const expert = await createExpert('current-owner@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const otherExpert = await createExpert('other-current-owner@test.com');
        const client = await createClient('current-owner-client@test.com');
        const currentAppointment = await createAppointment(
            otherExpert._id,
            '2026-07-03T10:00:00.000Z',
            'booked',
            client._id,
        );
        const newAppointment = await createAppointment(expert._id, '2026-07-03T12:00:00.000Z', 'free');

        await expect(persistedExpert.rescheduleAppointment(currentAppointment, newAppointment)).rejects.toThrow(
            'Current appointment does not belong to this expert',
        );
    });

    it('throws when the new appointment belongs to another expert', async () => {
        const expert = await createExpert('new-owner@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const otherExpert = await createExpert('other-new-owner@test.com');
        const client = await createClient('new-owner-client@test.com');
        const currentAppointment = await createAppointment(
            expert._id,
            '2026-07-04T10:00:00.000Z',
            'booked',
            client._id,
        );
        const newAppointment = await createAppointment(otherExpert._id, '2026-07-04T12:00:00.000Z', 'free');

        await expect(persistedExpert.rescheduleAppointment(currentAppointment, newAppointment)).rejects.toThrow(
            'New appointment does not belong to this expert',
        );
    });

    it('throws when the current appointment is not booked', async () => {
        const expert = await createExpert('current-free@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const currentAppointment = await createAppointment(expert._id, '2026-07-05T10:00:00.000Z', 'free');
        const newAppointment = await createAppointment(expert._id, '2026-07-05T12:00:00.000Z', 'free');

        await expect(persistedExpert.rescheduleAppointment(currentAppointment, newAppointment)).rejects.toThrow(
            'Only booked appointments can be rescheduled',
        );
    });

    it('throws when the new appointment is not free', async () => {
        const expert = await createExpert('new-not-free@test.com');
        const persistedExpert = await Expert.findById(expert._id);
        const client = await createClient('new-not-free-client@test.com');
        const currentAppointment = await createAppointment(
            expert._id,
            '2026-07-06T10:00:00.000Z',
            'booked',
            client._id,
        );
        const newAppointment = await createAppointment(expert._id, '2026-07-06T12:00:00.000Z', 'cancelled');

        await expect(persistedExpert.rescheduleAppointment(currentAppointment, newAppointment)).rejects.toThrow(
            'New appointment must be free',
        );
    });
});
