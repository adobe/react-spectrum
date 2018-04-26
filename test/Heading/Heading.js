import assert from 'assert';
import Heading from '../../src/Heading';
import React from 'react';
import {shallow} from 'enzyme';

describe('Heading', () => {
  it('supports different sizes', () => {
    const tree = shallow(<Heading>Testing</Heading>);
    assertSize(tree, 1, 'h1', 'display');
    changeAndAssertSize(tree, 2, 'h2', 'pageTitle');
    changeAndAssertSize(tree, 3, 'h2', 'subtitle1');
    changeAndAssertSize(tree, 4, 'h3', 'subtitle2');
    changeAndAssertSize(tree, 5, 'h4', 'subtitle3');
    changeAndAssertSize(tree, 6, 'h4', 'subtitle3');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Heading className="myClass">Testing</Heading>);
    assert.equal(tree.prop('className'), 'spectrum-Heading spectrum-Heading--display myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Heading data-foo>My Heading</Heading>);
    assert.equal(tree.prop('data-foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<Heading>My Heading</Heading>);
    assert.equal(tree.childAt(0).text(), 'My Heading');
  });
});


function changeAndAssertSize(tree, size, element, className) {
  tree.setProps({size});
  assertSize(tree, size, element, className);
}

function assertSize(tree, size, element, className) {
  assert.equal(tree.type(), element);
  assert.equal(tree.prop('className'), `spectrum-Heading spectrum-Heading--${className}`);
}
