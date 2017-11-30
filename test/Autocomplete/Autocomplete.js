import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import {Menu, MenuItem} from '../../src/Menu';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {sleep} from '../utils';

const assertMenuFocusStates = (tree, expectedFocusStates) => {
  assert.deepEqual(tree.find(MenuItem).map(c => c.prop('focused')), expectedFocusStates);
};

describe('Autocomplete', () => {
  it('should render children', () => {
    const tree = shallow(
      <Autocomplete className="test">
        <input />
      </Autocomplete>
    );

    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete test');
    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(tree.find('input').prop('value'), '');
    assert.equal(typeof tree.find('input').prop('onChange'), 'function');
  });

  it('should render other children and select the right input', () => {
    const tree = shallow(
      <Autocomplete className="test">
        <span />
        <input autocompleteInput />
      </Autocomplete>
    );

    assert.equal(tree.childAt(0).type(), 'span');
    assert.equal(tree.childAt(1).type(), 'input');
    assert.equal(typeof tree.find('input').prop('onChange'), 'function');
    assert.equal(tree.childAt(2).prop('show'), false);
  });

  it('should call getCompletions and render a menu with results', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    assert.equal(tree.find('input').prop('value'), 'test');

    tree.find('input').simulate('mouseEnter');
    await sleep(1);

    assert.equal(tree.childAt(1).prop('show'), true);
    assert.equal(tree.find(MenuItem).length, 2);
    assert.equal(tree.find(MenuItem).getElements()[0].key, 'item-0');
  });

  it('should call getCompletions and render a menu with results asynchronously', async () => {
    const getCompletions = async v => {
      await sleep(10);
      return ['one', 'two'];
    };

    const tree = shallow(
      <Autocomplete getCompletions={getCompletions}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(15); // Wait for async getCompletions

    assert.equal(tree.find('input').prop('value'), 'test');

    tree.find('input').simulate('mouseEnter');
    await sleep(1);

    assert.equal(tree.childAt(1).prop('show'), true);

    tree.find('input').simulate('mouseEnter');
    await sleep(1);
    assert.equal(tree.find(MenuItem).length, 2);
  });

  it('should handle keyboard navigation of menu items', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions
    tree.find('input').simulate('mouseEnter');
    await sleep(1);

    assertMenuFocusStates(tree, [true, false, false]);

    tree.find('input').simulate('keyDown', {key: 'ArrowDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, true, false]);

    tree.find('input').simulate('keyDown', {key: 'ArrowUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [true, false, false]);

    tree.find('input').simulate('keyDown', {key: 'End', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, true]);

    tree.find('input').simulate('keyDown', {key: 'Home', preventDefault: () => {}});
    assertMenuFocusStates(tree, [true, false, false]);

    // Wrapping behavior
    tree.find('input').simulate('keyDown', {key: 'ArrowUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, true]);

    tree.find('input').simulate('keyDown', {key: 'ArrowDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [true, false, false]);

    // Mouse focus
    tree.find(MenuItem).at(1).simulate('mouseEnter');
    assertMenuFocusStates(tree, [false, true, false]);
  });

  it('should select an item when the enter key is pressed', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    tree.find('input').simulate('keyDown', {key: 'ArrowDown', preventDefault: function () {}});
    tree.find('input').simulate('keyDown', {key: 'Enter', preventDefault: function () {}});

    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(tree.find('input').prop('value'), 'two');
  });

  it('should hide the menu when the escape key is pressed', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    tree.find('input').simulate('keyDown', {key: 'Escape', preventDefault: function () {}});

    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(tree.find('input').prop('value'), 'test');
  });

  it('should hide the menu on blur', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete is-focused');
    assert.equal(tree.find(Menu).length, 1);

    tree.find('input').simulate('blur');
    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete');
    assert.equal(tree.childAt(1).prop('show'), false);
  });

  it('supports a controlled mode', async () => {
    const onChange = sinon.spy();
    const onSelect = sinon.spy();

    const tree = shallow(
      <Autocomplete value="foo" onChange={onChange} onSelect={onSelect} getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    assert.equal(tree.find('input').prop('value'), 'foo');

    tree.find('input').simulate('change', 'test');

    await sleep(1);

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], 'test');
    assert.equal(onSelect.callCount, 0);

    // It doesn't change the value in controlled mode
    assert.equal(tree.find('input').prop('value'), 'foo');

    tree.find('input').simulate('keyDown', {key: 'Enter', preventDefault: function () {}});

    assert.equal(onChange.callCount, 2);
    assert.deepEqual(onChange.getCall(1).args[0], 'one');
    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'one');
    assert.equal(tree.find('input').prop('value'), 'foo');
  });

  it('does not select first menu item by default with allowCreate', async () => {
    const onSelect = sinon.spy();
    const tree = shallow(
      <Autocomplete allowCreate onSelect={onSelect} getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    tree.find('input').simulate('focus');

    // No menu item selected
    assertMenuFocusStates(tree, [false, false, false]);

    // Emits onSelect for non-selected item
    tree.find('input').simulate('keyDown', {key: 'Enter', preventDefault: function () {}});
    assert.equal(tree.find('input').prop('value'), 'test');

    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'test');
  });

  it('can toggle the menu programmatically', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    tree.instance().toggleMenu();

    await sleep(1);
    tree.update();
    assert.equal(tree.childAt(1).prop('show'), true);

    tree.instance().toggleMenu();
    tree.update();

    assert.equal(tree.childAt(1).prop('show'), false);
  });

  it('supports non-string completions', async () => {
    const onSelect = sinon.spy();
    const tree = shallow(
      <Autocomplete onSelect={onSelect} getCompletions={v => [{id: 1, label: 'one'}, {id: 2, label: 'two'}]}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'test');

    await sleep(1);

    tree.find('input').simulate('keyDown', {key: 'Enter', preventDefault: function () {}});
    assert.equal(tree.find('input').prop('value'), 'one');

    assert.equal(onSelect.callCount, 1);
    assert.deepEqual(onSelect.getCall(0).args[0], {id: 1, label: 'one'});
  });

  describe('autocompletes when Tab is pressed', () => {
    const render = async (getCompletions) => {
      const preventDefaultSpy = sinon.spy();
      const onSelectSpy = sinon.spy();

      const tree = shallow(
        <Autocomplete onSelect={onSelectSpy} getCompletions={getCompletions}>
          <input />
        </Autocomplete>
      );
      const input = tree.find('input');

      input.simulate('focus');
      input.simulate('change', 't');

      await sleep(1);

      input
        .simulate('keydown', {key: 'Tab', preventDefault: preventDefaultSpy});

      return {preventDefaultSpy, onSelectSpy};
    };

    it('if the menu is open', async () => {
      const {preventDefaultSpy, onSelectSpy} = await render(v => ['one', 'two', 'three']);

      assert(onSelectSpy.withArgs('one').calledOnce);
      assert(preventDefaultSpy.calledOnce);
    });

    it('otherwise performs default behavior', async () => {
      const {preventDefaultSpy, onSelectSpy} = await render(v => []);

      assert(onSelectSpy.notCalled);
      assert(preventDefaultSpy.notCalled);
    });
  });
});
