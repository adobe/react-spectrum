import assert from 'assert';
import {List} from '../../src/List';
import {Menu} from '../../src/Menu';
import {mount} from 'enzyme';
import React from 'react';

describe('Menu', () => {
  it('renders a List with correct className', function () {
    let tree = mount(<Menu className="bell" />);
    let lists = tree.find(List);
    assert.equal(lists.length, 1);
    let list = lists.at(0);
    assert(list.find('.bell').length > 0);

    tree.unmount();
  });
});
