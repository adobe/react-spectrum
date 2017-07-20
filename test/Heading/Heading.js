
import assert from 'assert';
import Heading from '../../src/Heading';
import React from 'react';
import {shallow} from 'enzyme';

describe('Heading', () => {
  it('supports different sizes', () => {
    const tree = shallow(<Heading>Testing</Heading>);
    assertSize(tree, 1);
    changeAndAssertSize(tree, 2);
    changeAndAssertSize(tree, 3);
    changeAndAssertSize(tree, 4);
    changeAndAssertSize(tree, 5);
    changeAndAssertSize(tree, 6);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Heading className="myClass">Testing</Heading>);
    assert.equal(tree.prop('className'), 'coral-Heading coral-Heading--1 myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Heading foo>My Heading</Heading>);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Heading>My Heading</Heading>);
    assert.equal(tree.children().node, 'My Heading');
  });
});


function changeAndAssertSize(tree, size) {
  tree.setProps({size});
  assertSize(tree, size);
}

function assertSize(tree, size) {
  assert.equal(tree.type(), `h${size}`);
  assert.equal(tree.prop('className'), `coral-Heading coral-Heading--${size}`);
}
