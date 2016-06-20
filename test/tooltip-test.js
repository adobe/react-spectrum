import React from 'react';
import expect from 'expect';
import Tooltip from '../src/Tooltip';
import { shallow } from 'enzyme';

describe('Tooltip', () => {
  it('supports different placements', () => {
    const tree = shallow(<Tooltip placement="top" />);
    expect(tree.prop('position')).toBe('top center');
  });

  it('supports different variants', () => {
    const tree = shallow(<Tooltip variant="info" />);
    const contentTree = shallow(tree.prop('content'));
    expect(contentTree.hasClass('coral3-Tooltip--info')).toBe(true);
  });
});
