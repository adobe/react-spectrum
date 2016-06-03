import expect from 'expect';
import { getTetherPositionFromPlacement } from '../../components/utils/tether';

describe('tether', () => {
  describe('getTetherPositionFromPlacement', () => {
    it('returns proper positions given valid placement', () => {
      expect(getTetherPositionFromPlacement('left')).toBe('left center');
      expect(getTetherPositionFromPlacement('right')).toBe('right center');
      expect(getTetherPositionFromPlacement('top')).toBe('top center');
      expect(getTetherPositionFromPlacement('bottom')).toBe('bottom center');
    });

    it('throws when supplied an invalid placement', () => {
      expect(() => { getTetherPositionFromPlacement('foo'); }).toThrow();
    });
  });
});
