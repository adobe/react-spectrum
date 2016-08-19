import expect from 'expect';
import { getTetherPositionFromPlacement } from '../../src/utils/tether';

describe('tether', () => {
  describe('getTetherPositionFromPlacement', () => {
    it('returns proper tether strings for shorthand placements', () => {
      expect(getTetherPositionFromPlacement('left')).toBe('left center');
      expect(getTetherPositionFromPlacement('right')).toBe('right center');
      expect(getTetherPositionFromPlacement('top')).toBe('top center');
      expect(getTetherPositionFromPlacement('bottom')).toBe('bottom center');
    });

    it('returns placement if it is valid', () => {
      expect(getTetherPositionFromPlacement('top right')).toBe('top right');
      expect(getTetherPositionFromPlacement('bottom left')).toBe('bottom left');
    });

    it('throws when supplied an invalid placement', () => {
      expect(() => { getTetherPositionFromPlacement('foo'); }).toThrow();
      expect(() => { getTetherPositionFromPlacement('bob jerry'); }).toThrow();
      expect(() => { getTetherPositionFromPlacement('center'); }).toThrow();
    });
  });
});
