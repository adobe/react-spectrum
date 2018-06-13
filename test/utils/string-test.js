import assert from 'assert';
import {isUrl, normalize, removeDiacritics} from '../../src/utils/string';

describe('string', () => {
  describe('isUrl', () => {
    it('matches urls', () => {
      assert.equal(isUrl('http://www.adobe.com/image.png'), true);
      assert.equal(isUrl('http://adobe.com/image.png'), true);
      assert.equal(isUrl('adobe.com/image.png'), true);
      assert.equal(isUrl('image.png'), true);
      assert.equal(isUrl('../image.png'), true);
      assert.equal(isUrl('/image.png'), true);
    });

    it('doesn\'t match icon types', () => {
      assert.equal(isUrl('add'), false);
      assert.equal(isUrl('adobe'), false);
      assert.equal(isUrl('foo-bar'), false);
    });
  });

  describe('normalize', () => {
    const str = '\u1E9B\u0323';
    it('Default: Canonically-composed form (NFC)', () => {
      assert.equal(normalize(str), '\u1E9B\u0323');
    });
    it('Canonically-decomposed form (NFD)', () => {
      assert.equal(normalize(str, 'NFD'), '\u017F\u0323\u0307');
    });
    it('Compatibly-composed (NFKC)', () => {
      assert.equal(normalize(str, 'NFKC'), '\u1E69');
    });
    it('Compatibly-composed (NFKD)', () => {
      assert.equal(normalize(str, 'NFKD'), '\u0073\u0323\u0307');
    });
  });

  it('removeDiacritics', () => {
    const str = '\u1E9B\u0323';
    assert.equal(removeDiacritics(str), '\u017F');
    assert.equal(removeDiacritics(str, 'NFD'), '\u017F');
    assert.equal(removeDiacritics(str, 'NFC'), '\u017F');
    assert.equal(removeDiacritics(str, 'NFKC'), '\u0073');
    assert.equal(removeDiacritics(str, 'NFKD'), '\u0073');
  });
});
