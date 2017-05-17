import assert from 'assert';
import {isUrl} from '../../src/utils/string';

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
});
