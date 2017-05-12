import assert from 'assert';
import moment from 'moment';
import {toMoment, isDateInRange} from '../../src/utils/moment';

describe('moment', () => {
  describe('toMoment', () => {
    const valueFormat = 'YYYY MM DD';

    it('returns current date if \'today\' is specified', () => {
      const now = moment();
      const date = toMoment('today');
      assert.equal(moment.isMoment(date), true);
      assert(now.isSame(date, 'day'));
    });

    describe('accepts moment object', () => {
      it('if moment is valid, returns clone', () => {
        const date = moment();
        const returnedDate = toMoment(date);
        assert.notEqual(date, returnedDate);
        assert.deepEqual(+date, +returnedDate);
      });

      it('if moment is not valid, returns null', () => {
        assert.equal(toMoment(moment('abc', valueFormat), valueFormat), null);
      });

      it('converts a date object into moment', () => {
        const date = new Date();
        const momentDate = toMoment(date);
        assert.deepEqual(+momentDate, +moment(date));
        assert.equal(moment.isMoment(momentDate), true);
      });
    });
  });

  it('isDateInRange', () => {
    const today = moment();
    const yesterday = moment().subtract(1, 'day');
    const tomorrow = moment().add(1, 'day');

    assert.equal(isDateInRange(today, yesterday, tomorrow), true);
    assert.equal(isDateInRange(yesterday, today, tomorrow), false);
    assert.equal(isDateInRange(tomorrow, yesterday, today), false);

    assert.equal(isDateInRange(today, yesterday, null), true);
    assert.equal(isDateInRange(today, null, tomorrow), true);
    assert.equal(isDateInRange(today), true);
  });
});
