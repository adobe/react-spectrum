import React from 'react';
import expect from 'expect';
import Popover from '../lib/Popover';
import DialogHeader from '../lib/internal/DialogHeader';
import { shallow } from 'enzyme';

describe('Popover', () => {
  it('supports different placements', () => {
    const tree = shallow(<Popover placement="top" />);
    expect(tree.prop('position')).toBe('top center');
  });

  it('supports different variants', () => {
    const tree = shallow(<Popover variant="info" />);
    const contentTree = shallow(tree.prop('content'));
    expect(contentTree.hasClass('coral-Dialog--info')).toBe(true);
  });

  it('supports optional title', () => {
    const tree = shallow(<Popover />);
    let header = shallow(tree.prop('content')).find(DialogHeader);
    expect(header.node).toNotExist();
    tree.setProps({ title: 'Foo' });
    header = shallow(tree.prop('content')).find(DialogHeader);
    expect(header.node).toExist();
    expect(header.prop('title')).toBe('Foo');
  });
});
