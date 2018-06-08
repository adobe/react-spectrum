import assert from 'assert';
import {MenuDivider} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';

describe('MenuDivider', () => {
  it('should render an hr element', () => {
    const tree = shallow(<MenuDivider />);
    assert.equal(tree.find('hr').length, 1);
  });
});
