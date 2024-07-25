import Add from '@spectrum-icons/workflow/Add';
import assert from 'assert';
import {Button} from '@adobe/react-spectrum';

describe('test', () => {
  it('should work', () => {
    assert.equal(typeof Button.render, 'function');
    assert.equal(typeof Add, 'function');
  });
});
