import {clamp, snapValueToStep} from '../src/number';

describe('number utils', () => {
  describe('clamp', () => {
    it('should constrain value between min and max', () => {
      expect(clamp(5, -1, 1)).toBe(1);
      expect(clamp(-5, -1, 1)).toBe(-1);
    });
  });

  describe('snapValueToStep', () => {
    it('should snap value to nearest step based on min and max', () => {
      expect(snapValueToStep(2, -0.5, 100, 3)).toBe(2.5);
      expect(snapValueToStep(-6.2, -2.5, 100, 3)).toBe(-2.5);
      expect(snapValueToStep(106.2, -2.5, 100, 3)).toBe(99.5);
      expect(snapValueToStep(-0.009999, -0.5, 0.5, 0.01)).toBe(-0.01);
      expect(snapValueToStep(-8, -100, 100, 5)).toBe(-10);
      expect(snapValueToStep(-6, -100, 100, 5)).toBe(-5);
      expect(snapValueToStep(3, -100, 100, 5)).toBe(5);
      expect(snapValueToStep(2, -100, 100, 5)).toBe(0);
    });

    it('should snap value nearest step when min or max are undefined', () => {
      expect(snapValueToStep(2, undefined, undefined, 3)).toBe(3);
      expect(snapValueToStep(6, undefined, 5, 3)).toBe(3);
      expect(snapValueToStep(4, undefined, 5, 3)).toBe(3);
      expect(snapValueToStep(1, 3, undefined, 3)).toBe(3);
    });
  });
});
