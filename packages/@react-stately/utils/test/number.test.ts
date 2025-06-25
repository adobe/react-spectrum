import {clamp, roundToStepPrecision, snapValueToStep} from '../src/number';

describe('number utils', () => {
  describe('clamp', () => {
    it('should constrain value between min and max', () => {
      expect(clamp(5, -1, 1)).toBe(1);
      expect(clamp(-5, -1, 1)).toBe(-1);
    });
  });

  describe('roundToStepPrecision', () => {
    it('should return the input unchanged for integer steps', () => {
      expect(roundToStepPrecision(7.123, 1)).toBe(7.123);
      expect(roundToStepPrecision(5, 10)).toBe(5);
    });
    it('should round to the correct decimal places for steps with decimals', () => {
      expect(roundToStepPrecision(1.24, 0.1)).toBe(1.24);
      expect(roundToStepPrecision(1.456, 0.01)).toBe(1.456);
      expect(roundToStepPrecision(1.2345, 0.015)).toBe(1.2345);
      expect(roundToStepPrecision(1.2345, 0.25)).toBe(1.235);
      // Should not overcount precision
      expect(roundToStepPrecision(2.349, 0.100)).toBe(2.35);
      expect(roundToStepPrecision(2.35, 0.100)).toBe(2.35);
      // Should handle negative values
      expect(roundToStepPrecision(-1.456, 0.01)).toBe(-1.456);
      // Should handle zero value
      expect(roundToStepPrecision(0, 0.01)).toBe(0);
    });
    it('should handle rounding for exponential step values', () => {
      expect(roundToStepPrecision(0.123456789, 1e-3)).toBe(0.1235);
      expect(roundToStepPrecision(0.123456789, 1e-7)).toBe(0.12345679);
      expect(roundToStepPrecision(0.123456789, 1.5e-7)).toBe(0.123456789);
      expect(roundToStepPrecision(0.123456789, 2.5e-6)).toBe(0.12345679);
      // Should handle exponential notation steps regardless of e/E case
      expect(roundToStepPrecision(0.123456789, 1E-8)).toBe(0.123456789);
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
