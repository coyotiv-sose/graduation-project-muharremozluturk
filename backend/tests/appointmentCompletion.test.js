const {
    getAppointmentEndTime,
    isAppointmentPast,
} = require('../src/utils/appointmentCompletion');

describe('appointmentCompletion helpers', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-04-12T12:00:00.000Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('getAppointmentEndTime prefers endTime over startTime', () => {
        const end = new Date('2026-04-12T13:00:00.000Z');
        const start = new Date('2026-04-12T10:00:00.000Z');
        expect(getAppointmentEndTime({ startTime: start, endTime: end }).getTime()).toBe(end.getTime());
    });

    it('getAppointmentEndTime falls back to startTime when endTime is missing', () => {
        const start = new Date('2026-04-12T10:00:00.000Z');
        expect(getAppointmentEndTime({ startTime: start }).getTime()).toBe(start.getTime());
    });

    it('isAppointmentPast compares against endTime (strictly before now)', () => {
        expect(isAppointmentPast({ endTime: new Date('2026-04-12T11:59:59.999Z') })).toBe(true);
        expect(isAppointmentPast({ endTime: new Date('2026-04-12T12:00:00.000Z') })).toBe(false);
        expect(isAppointmentPast({ endTime: new Date('2026-04-12T12:00:00.001Z') })).toBe(false);
    });
});
