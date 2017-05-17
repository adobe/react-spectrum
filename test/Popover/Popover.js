import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import Popover from '../../src/Popover';

describe('Popover', () => {
  it('supports different variants', () => {
    const tree = shallow(<Popover variant="info" />);
    assert.equal(tree.hasClass('coral-Dialog--info'), true);
  });

  // it('supports different variants', () => {
  //   const tree = shallow(<Popover variant="info" />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.hasClass('coral-Dialog--info'), true);
  // });

  // it('supports optional title', () => {
  //   const tree = shallow(<Popover />);
  //   let header = shallow(tree.prop('content')).find(DialogHeader);
  //   assert(!header.node);
  //   tree.setProps({title: 'Foo'});
  //   header = shallow(tree.prop('content')).find(DialogHeader);
  //   assert(header.node);
  //   assert.equal(header.prop('title'), 'Foo');
  // });

  // it('supports additional classNames', () => {
  //   const tree = shallow(<Popover className="foo" />);
  //   assert.equal(tree.hasClass('foo'), true);
  // });

  // it('supports additional properties', () => {
  //   const tree = shallow(<Popover foo />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.prop('foo'), true);
  // });
});
