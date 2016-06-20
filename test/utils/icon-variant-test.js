import expect from 'expect';
import { getVariantIcon } from '../../src/utils/icon-variant';

describe('icon-variant', () => {
  describe('getVariantIcon', () => {
    it('returns proper positions given valid placement', () => {
      expect(getVariantIcon('error')).toBe('alert');
      expect(getVariantIcon('warning')).toBe('alert');
      expect(getVariantIcon('success')).toBe('checkCircle');
      expect(getVariantIcon('help')).toBe('helpCircle');
      expect(getVariantIcon('info')).toBe('infoCircle');
    });

    it('throws when supplied an invalid placement', () => {
      expect(() => { getVariantIcon('foo'); }).toThrow();
    });
  });
});
