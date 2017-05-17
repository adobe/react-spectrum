import assert from 'assert';
import {getTetherPositionFromPlacement} from '../../src/utils/tether';

describe('tether', () => {
  describe('getTetherPositionFromPlacement', () => {
    it('returns proper tether strings for shorthand placements', () => {
      assert.equal(getTetherPositionFromPlacement('left'), 'left center');
      assert.equal(getTetherPositionFromPlacement('right'), 'right center');
      assert.equal(getTetherPositionFromPlacement('top'), 'top center');
      assert.equal(getTetherPositionFromPlacement('bottom'), 'bottom center');
    });

    it('returns placement if it is valid', () => {
      assert.equal(getTetherPositionFromPlacement('top right'), 'top right');
      assert.equal(getTetherPositionFromPlacement('bottom left'), 'bottom left');
    });

    it('throws when supplied an invalid placement', () => {
      assert.throws(() => { getTetherPositionFromPlacement('foo'); });
      assert.throws(() => { getTetherPositionFromPlacement('bob jerry'); });
      assert.throws(() => { getTetherPositionFromPlacement('center'); });
    });
  });
});
