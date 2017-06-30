import assert from 'assert';
import {getVariantIcon} from '../../src/utils/icon-variant';

describe('icon-variant', () => {
  describe('getVariantIcon', () => {
    it('returns proper positions given valid placement', () => {
      assert.equal(getVariantIcon('error'), 'alert');
      assert.equal(getVariantIcon('warning'), 'alert');
      assert.equal(getVariantIcon('success'), 'checkCircle');
      assert.equal(getVariantIcon('help'), 'helpCircle');
      assert.equal(getVariantIcon('info'), 'infoCircle');
    });

    it('throws when supplied an invalid placement', () => {
      assert.throws(() => {getVariantIcon('foo'); });
    });
  });
});
