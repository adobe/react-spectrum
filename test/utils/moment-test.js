import expect from 'expect';
import moment from 'moment';
import { toMoment, isDateInRange } from '../../src/utils/moment';

describe('moment', () => {
  describe('toMoment', () => {
    const valueFormat = 'YYYY MM DD';

    it('returns current date if \'today\' is specified', () => {
      const now = moment();
      const date = toMoment('today');
      expect(moment.isMoment(date)).toBe(true);
      expect(now.isSame(date, 'day'));
    });

    describe('accepts moment object', () => {
      it('if moment is valid, returns clone', () => {
        const date = moment();
        const returnedDate = toMoment(date);
        expect(date).toNotBe(returnedDate);
        expect(+date).toEqual(+returnedDate);
      });

      it('if moment is not valid, returns null', () => {
        expect(toMoment(moment('abc', valueFormat), valueFormat)).toBe(null);
      });

      it('converts a date object into moment', () => {
        const date = new Date();
        const momentDate = toMoment(date);
        expect(+momentDate).toEqual(+moment(date));
        expect(moment.isMoment(momentDate)).toBe(true);
      });
    });
  });

  it('isDateInRange', () => {
    const today = moment();
    const yesterday = moment().subtract(1, 'day');
    const tomorrow = moment().add(1, 'day');

    expect(isDateInRange(today, yesterday, tomorrow)).toBe(true);
    expect(isDateInRange(yesterday, today, tomorrow)).toBe(false);
    expect(isDateInRange(tomorrow, yesterday, today)).toBe(false);

    expect(isDateInRange(today, yesterday, null)).toBe(true);
    expect(isDateInRange(today, null, tomorrow)).toBe(true);
    expect(isDateInRange(today)).toBe(true);
  });
});
