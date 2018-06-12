import assert from 'assert';
import {ListItem} from '../../src/List';
import {MenuItem} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';

describe('MenuItem', () => {
  it('should be a ListItem', () => {
    const tree = shallow(<MenuItem />);
    assert.equal(tree.find(ListItem).length, 1);
  });
  it('should accept a label', () => {
    const tree = shallow(<MenuItem label="foo" />);
    let items = tree.find(ListItem);
    assert.equal(items.length, 1);
    assert.equal(items.at(0).prop('label'), 'foo');
  });
});
