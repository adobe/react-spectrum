import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import {Menu, MenuItem} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';

const assertMenuFocusStates = (tree, expectedFocusStates) => {
  assert.deepEqual(tree.find(MenuItem).map(c => c.prop('focused')), expectedFocusStates);
};

const findInput = tree => tree.find('input');

describe('Autocomplete', () => {
  it('should render children', () => {
    const tree = shallow(
      <Autocomplete className="test">
        <input />
      </Autocomplete>
    );

    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete test');
    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(findInput(tree).prop('value'), '');
    assert.equal(typeof findInput(tree).prop('onChange'), 'function');
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
    assert.equal(typeof findInput(tree).prop('onChange'), 'function');
    assert.equal(tree.childAt(2).prop('show'), false);
  });

  it('should call getCompletions and render a menu with results', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    assert.equal(findInput(tree).prop('value'), 'test');

    findInput(tree).simulate('mouseEnter');
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

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(15); // Wait for async getCompletions

    assert.equal(findInput(tree).prop('value'), 'test');

    findInput(tree).simulate('mouseEnter');
    await sleep(1);

    assert.equal(tree.childAt(1).prop('show'), true);

    findInput(tree).simulate('mouseEnter');
    await sleep(1);
    assert.equal(tree.find(MenuItem).length, 2);
  });

  it('should handle keyboard navigation of menu items', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions
    findInput(tree).simulate('mouseEnter');
    await sleep(1);

    assertMenuFocusStates(tree, [true, false, false]);

    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, true, false]);

    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, true]);

    findInput(tree).simulate('keyDown', {key: 'ArrowUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, true, false]);

    findInput(tree).simulate('keyDown', {key: 'End', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, true]);

    findInput(tree).simulate('keyDown', {key: 'Home', preventDefault: () => {}});
    assertMenuFocusStates(tree, [true, false, false]);

    // Wrapping behavior
    findInput(tree).simulate('keyDown', {key: 'ArrowUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, true]);

    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [true, false, false]);

    // Mouse focus
    tree.find(MenuItem).at(1).simulate('mouseEnter');
    assertMenuFocusStates(tree, [false, true, false]);
  });

  it('should handle PageUp/PageDown navigation of menu items', async () => {
    const itemHeight = 32;
    const tree = mount(
      <Autocomplete getCompletions={v => ['one', 'two', 'three', 'four', 'five', 'six']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');

    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});

    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions
    findInput(tree).simulate('mouseEnter');
    await sleep(1);

    // Stub DOM dimensions
    const listNode = tree.find('ul').getDOMNode();
    const items = tree.find(MenuItem);
    let itemNode;
    const stubs = [];
    stubs.push(sinon.stub(listNode, 'clientHeight').get(() => itemHeight * 2));
    stubs.push(sinon.stub(listNode, 'scrollHeight').get(() => itemHeight * items.length));
    items.forEach((item, index) => {
      itemNode = item.getDOMNode();
      stubs.push(sinon.stub(itemNode, 'offsetHeight').get(() => itemHeight));
      stubs.push(sinon.stub(itemNode, 'offsetTop').get(() => itemHeight * index));
    });

    assertMenuFocusStates(tree, [true, false, false, false, false, false]);

    // Page up/Page down tests rely on offsetTop and clientHeight
    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, true, false, false, false]);

    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, false, false, true, false]);

    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, false, false, false, true]);

    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, false, false, true, false, false]);

    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [false, true, false, false, false, false]);

    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});
    assertMenuFocusStates(tree, [true, false, false, false, false, false]);

    stubs.forEach(stub => {
      stub.restore();
      stub.reset();
    });
    tree.unmount();
  });

  it('should select an item when the enter key is pressed', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    findInput(tree).simulate('keyDown', {key: 'Enter', preventDefault: function () {}});

    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(findInput(tree).prop('value'), 'one');
  });

  it('should not select an item when the space key is pressed', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: function () {}});
    findInput(tree).simulate('keyDown', {key: ' ', preventDefault: function () {}});

    assert.equal(tree.childAt(1).prop('show'), true);
    assert.equal(findInput(tree).prop('value'), 'test');
  });

  it('should hide the menu when the escape key is pressed', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    findInput(tree).simulate('keydown', {key: 'Escape', preventDefault: function () {}});

    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(findInput(tree).prop('value'), 'test');
  });

  it('should show the menu when ArrowDown is pressed', async () => {
    const spy = sinon.spy();
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']} onMenuShow={spy}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');

    findInput(tree).simulate('keydown', {key: 'ArrowDown', preventDefault: function () {}});

    await sleep(1); // Wait for async getCompletions
    tree.update();

    assert.equal(tree.childAt(1).prop('show'), true);

    assert(spy.called);
  });

  it('should show the menu when the Alt + ArrowDown is pressed', async () => {
    const spy = sinon.spy();
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']} onMenuShow={spy}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');

    findInput(tree).simulate('keydown', {key: 'ArrowDown', altKey: true, preventDefault: function () {}});

    await sleep(1); // Wait for async getCompletions
    tree.update();

    assert.equal(tree.childAt(1).prop('show'), true);

    assert(spy.called);
  });

  it('should hide the menu when the Alt + ArrowUp is pressed', async () => {
    const spy = sinon.spy();
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']} onMenuHide={spy}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    findInput(tree).simulate('keydown', {key: 'ArrowUp', altKey: true, preventDefault: function () {}});

    assert.equal(tree.childAt(1).prop('show'), false);
    assert.equal(findInput(tree).prop('value'), 'test');

    assert(spy.called);
  });

  it('should hide the menu on blur', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete is-focused');
    assert.equal(tree.find(Menu).length, 1);

    findInput(tree).simulate('blur');
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

    assert.equal(findInput(tree).prop('value'), 'foo');

    findInput(tree).simulate('change', 'test');

    await sleep(1);

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], 'test');
    assert.equal(onSelect.callCount, 0);

    // It doesn't change the value in controlled mode
    assert.equal(findInput(tree).prop('value'), 'foo');

    findInput(tree).simulate('keyDown', {key: 'ArrowDown', altKey: true, preventDefault: function () {}});
    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: function () {}});
    findInput(tree).simulate('keyDown', {key: 'Enter', preventDefault: function () {}});

    assert.equal(onChange.callCount, 2);
    assert.deepEqual(onChange.getCall(1).args[0], 'one');

    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'one');
    assert.equal(findInput(tree).prop('value'), 'foo');
  });

  it('does not select first menu item by default with allowCreate', async () => {
    const onSelect = sinon.spy();
    const tree = shallow(
      <Autocomplete allowCreate onSelect={onSelect} getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1); // Wait for async getCompletions

    findInput(tree).simulate('focus');

    // No menu item selected
    assertMenuFocusStates(tree, [false, false, false]);

    // Emits onSelect for non-selected item
    findInput(tree).simulate('keyDown', {key: 'Enter', preventDefault: function () {}});
    assert.equal(findInput(tree).prop('value'), 'test');

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

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await sleep(1);

    findInput(tree).simulate('keyDown', {key: 'Enter', preventDefault: function () {}});
    assert.equal(findInput(tree).prop('value'), 'one');

    assert.equal(onSelect.callCount, 1);
    assert.deepEqual(onSelect.getCall(0).args[0], {id: 1, label: 'one'});
  });

  it('supports caching of width when componentDidUpdate is called', async () => {
    const tree = mount(
      <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    // stub offsetWidth getter
    const stubWidth = 192;
    const stub = sinon.stub(tree.instance().wrapper, 'offsetWidth').get(() => stubWidth);

    // show menu
    tree.instance().toggleMenu();
    await sleep(1);
    assert.equal(tree.instance().state.width, stubWidth);
    assert.equal(tree.instance().menu.props.style.width, stubWidth + 'px');

    // restore original offsetWidth getter
    stub.restore();
  });

  it('should show a checkmark on the currently selected menu item', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'two');

    await sleep(1); // Wait for async getCompletions
    tree.update();

    assert.equal(tree.find('input').prop('value'), 'two');

    assert.equal(tree.find(MenuItem).length, 2);
    assert.equal(tree.find(MenuItem).at(1).prop('selected'), true);
  });

  it('should focus the selected index when showing the menu', async () => {
    const tree = shallow(
      <Autocomplete value="two" getCompletions={v => ['one', 'two']}>
        <input />
      </Autocomplete>
    );

    await tree.instance().showMenu();
    tree.update();

    assert.equal(tree.find(MenuItem).length, 2);
    assert.equal(tree.find(MenuItem).at(1).prop('selected'), true);

    assertMenuFocusStates(tree, [false, true]);
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
      const input = findInput(tree);

      input.simulate('focus');
      input.simulate('change', 't');

      await sleep(1);

      input
        .simulate('keydown', {key: 'ArrowDown', preventDefault: function () {}});

      input
        .simulate('keydown', {key: 'Tab', preventDefault: preventDefaultSpy});

      return {preventDefaultSpy, onSelectSpy};
    };

    it('if the menu is open', async () => {
      const {preventDefaultSpy, onSelectSpy} = await render(v => ['one', 'two', 'three']);

      assert(onSelectSpy.withArgs('two').calledOnce);
      assert(preventDefaultSpy.calledOnce);
    });

    it('otherwise performs default behavior', async () => {
      const {preventDefaultSpy, onSelectSpy} = await render(v => []);

      assert(onSelectSpy.notCalled);
      assert(preventDefaultSpy.notCalled);
    });
  });

  describe('Accessibility', () => {
    it('should have appropriate role and aria-* attributes', async () => {
      const tree = shallow(
        <Autocomplete getCompletions={v => ['one', 'two', 'three']}>
          <input id="foo" />
        </Autocomplete>
      );

      assert.equal(tree.prop('role'), 'combobox');
      assert.equal(tree.prop('aria-controls'), undefined);
      assert.equal(tree.prop('aria-expanded'), false);
      assert.equal(tree.prop('aria-haspopup'), 'true');
      assert.equal(tree.prop('aria-owns'), undefined);

      assert.equal(findInput(tree).prop('id'), 'foo');
      assert.equal(findInput(tree).prop('role'), 'textbox');
      assert.equal(findInput(tree).prop('aria-autocomplete'), 'list');
      assert.equal(findInput(tree).prop('aria-controls'), undefined);

      findInput(tree).simulate('focus');
      findInput(tree).simulate('change', 'test');

      await sleep(1); // Wait for async getCompletions
      tree.update();

      const menu = tree.find(Menu);
      const menuItems = tree.find(MenuItem);

      assert.equal(tree.childAt(1).prop('show'), true);
      assert.equal(menu.length, 1);
      assert.equal(menuItems.length, 3);

      assert.equal(tree.prop('aria-expanded'), true);
      assert.equal(tree.prop('aria-owns'), menu.prop('id'));
      assert.equal(findInput(tree).prop('aria-controls'), menu.prop('id'));

      assert.equal(menu.prop('role'), 'listbox');
      menuItems.forEach((item) => {
        assert.equal(item.prop('role'), 'option');
      });

      assert.equal(findInput(tree).prop('aria-activedescendant'), menuItems.at(0).prop('id'));

      findInput(tree).simulate('keydown', {key: 'ArrowDown', preventDefault: function () {}});
      assert.equal(findInput(tree).prop('aria-activedescendant'), menuItems.at(1).prop('id'));

      findInput(tree).simulate('keydown', {key: 'ArrowDown', preventDefault: function () {}});
      assert.equal(findInput(tree).prop('aria-activedescendant'), menuItems.at(2).prop('id'));

      let mouseDownPreventDefault = sinon.spy();
      menuItems.at(2).simulate('mouseDown', {preventDefault: mouseDownPreventDefault});
      assert(mouseDownPreventDefault.called);

      findInput(tree).simulate('keydown', {key: 'Enter', preventDefault: function () {}});

      assert.equal(tree.prop('aria-expanded'), false);
      assert.equal(tree.prop('aria-owns'), undefined);

      assert.equal(findInput(tree).prop('aria-controls'), undefined);
      assert.equal(findInput(tree).prop('aria-activedescendant'), undefined);
      assert.equal(findInput(tree).prop('value'), 'three');
    });
  });
});
