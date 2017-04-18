import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import Popover from '../src/Popover';
import DialogHeader from '../src/Dialog/js/DialogHeader';

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

  it('supports additional classNames', () => {
    const tree = shallow(<Popover className="foo" />);
    expect(tree.hasClass('foo')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Popover foo />);
    const contentTree = shallow(tree.prop('content'));
    expect(contentTree.prop('foo')).toBe(true);
  });
});
