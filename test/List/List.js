import assert from 'assert';
import FocusManager from '../../src/utils/FocusManager';
import {List} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';

const render = (props = {}) => shallow(<List {...props} />);

describe('List', () => {
  it('renders a ul with correct className', function () {
    let tree = render();
    assert.equal(tree.type(), FocusManager);
    assert.equal(tree.prop('itemSelector'), '.spectrum-SelectList-item:not(.is-disabled)');
    assert.equal(tree.prop('selectedItemSelector'), '.spectrum-SelectList-item:not(.is-disabled).is-selected');
    assert.equal(tree.find('.spectrum-SelectList').length, 1);
  });
});
