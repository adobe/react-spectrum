import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import Tooltip from '../../src/Tooltip';

describe('Tooltip', () => {
  it('supports different placements', () => {
    const tree = shallow(<Tooltip placement="top" />);
    assert(tree.hasClass('coral3-Tooltip--arrowUp'));
  });

  it('supports different variants', () => {
    const tree = shallow(<Tooltip variant="info" />);
    assert(tree.hasClass('coral3-Tooltip--info'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Tooltip className="foo" />);
    assert(tree.hasClass('foo'));
  });

  it('supports children', () => {
    const tree = shallow(<Tooltip>oh hey</Tooltip>);
    assert.equal(tree.prop('children'), 'oh hey');
  });
});
