import expect from 'expect';
import {isUrl} from '../../src/utils/string';

describe('string', () => {
  describe('isUrl', () => {
    it('matches urls', () => {
      expect(isUrl('http://www.adobe.com/image.png')).toBe(true);
      expect(isUrl('http://adobe.com/image.png')).toBe(true);
      expect(isUrl('adobe.com/image.png')).toBe(true);
      expect(isUrl('image.png')).toBe(true);
      expect(isUrl('../image.png')).toBe(true);
      expect(isUrl('/image.png')).toBe(true);
    });

    it('doesn\'t match icon types', () => {
      expect(isUrl('add')).toBe(false);
      expect(isUrl('adobe')).toBe(false);
      expect(isUrl('foo-bar')).toBe(false);
    });
  });
});
