import assert from 'assert';
import FocusManager from '../../src/utils/FocusManager';
import {List} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';

describe('List', () => {
  it('renders a ul with correct className', function () {
    let tree = shallow(<List />);
    assert.equal(tree.type(), FocusManager);
    assert.equal(tree.prop('itemSelector'), '.spectrum-Menu-item:not(.is-disabled)');
    assert.equal(tree.prop('selectedItemSelector'), '.spectrum-Menu-item:not(.is-disabled).is-selected');
    assert.equal(tree.find('ul').hasClass('spectrum-Menu'), true);
    assert.equal(tree.find('ul').hasClass('is-selectable'), false);
  });

  it('is selectable when it should be', function () {
    const tree = shallow(<List selectable />);
    assert.equal(tree.find('ul').hasClass('is-selectable'), true);
  });
});
