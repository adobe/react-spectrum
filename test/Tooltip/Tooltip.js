import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Tooltip from '../../src/Tooltip';

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

  it('supports additional classNames', () => {
    const tree = shallow(<Tooltip className="foo" />);
    const contentTree = shallow(tree.prop('content'));
    expect(contentTree.hasClass('foo')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Tooltip foo />);
    const contentTree = shallow(tree.prop('content'));
    expect(contentTree.prop('foo')).toBe(true);
  });

  it('supports tetherOptions', () => {
    const tree = shallow(<Tooltip tetherOptions={ { offset: '10px 0' } } />);
    expect(tree.prop('tetherOptions').offset).toBe('10px 0');
  });

  it('supports custom hoverOpenDelay', () => {
    const tree = shallow(<Tooltip hoverOpenDelay={ 77 } />);
    expect(tree.prop('hoverOpenDelay')).toBe(77);
  });

  it('supports custom hoverCloseDelay', () => {
    const tree = shallow(<Tooltip hoverCloseDelay={ 66 } />);
    expect(tree.prop('hoverCloseDelay')).toBe(66);
  });
});
