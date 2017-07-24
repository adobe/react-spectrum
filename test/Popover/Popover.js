import assert from 'assert';
import Popover from '../../src/Popover';
import React from 'react';
import {shallow} from 'enzyme';

describe('Popover', () => {
  it('supports different variants', () => {
    const tree = shallow(<Popover variant="info" />);
    assert.equal(tree.hasClass('spectrum-Dialog--info'), true);
  });

  // it('supports different variants', () => {
  //   const tree = shallow(<Popover variant="info" />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.hasClass('spectrum-Dialog--info'), true);
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
