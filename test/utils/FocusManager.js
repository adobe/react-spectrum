import assert from 'assert';
import FocusManager from '../../src/utils/FocusManager';
import {mount} from 'enzyme';
import React from 'react';

describe('FocusManager', function () {
  let tree;
  beforeEach(() => {
    tree = mount(
      <FocusManager itemSelector=".item:not(.disabled)">
        <ul>
          <li className="item" tabIndex="-1">Item 1</li>
          <li className="item disabled" tabIndex="-1">Item 2</li>
          <li className="item" tabIndex="-1">Item 3</li>
          <li className="item" tabIndex="-1">Item 3</li>
        </ul>
      </FocusManager>
    );
  });

  it('when ArrowDown key is pressed, focus next not disabled item', () => {
    let item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
    item = tree.find('.item').at(2);
    item.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
  });

  it('when ArrowDown key is pressed on last item, focus first not disabled item', () => {
    let item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'ArrowDown', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
  });

  it('when ArrowUp key is pressed, focus previous not disabled item', () => {
    let item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(2).getDOMNode(), document.activeElement);
    item = tree.find('.item').at(2);
    item.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
  });

  it('when ArrowUp key is pressed on first item, focus last not disabled item', () => {
    let item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'ArrowUp', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
  });

  it('when End key is pressed, focus last not disabled item', () => {
    let item = tree.find('.item').at(0);
    item.simulate('keydown', {key: 'End', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(3).getDOMNode(), document.activeElement);
  });

  it('when Home key is pressed, focus first not disabled item', () => {
    let item = tree.find('.item').at(3);
    item.simulate('keydown', {key: 'Home', preventDefault: () => {}});
    assert.equal(tree.find('.item').at(0).getDOMNode(), document.activeElement);
  });
});
