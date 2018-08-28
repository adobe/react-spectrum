import assert from 'assert';
import {MenuDivider} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';

describe('MenuDivider', () => {
  it('should render an li element with role="separator"', () => {
    const tree = shallow(<MenuDivider />);
    assert.equal(tree.find('li').length, 1);
    assert.equal(tree.find('li').prop('role'), 'separator');
  });
});
