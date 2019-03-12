import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import {Menu, MenuItem} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import {nextEventLoopIteration, sleep} from '../utils';
import Overlay from '../../src/OverlayTrigger/js/Overlay';
import React from 'react';
import sinon from 'sinon';

const assertMenuFocusStates = (tree, expectedFocusStates) => {
  assert.deepEqual(tree.find(MenuItem).map(c => c.prop('focused')), expectedFocusStates);
};

const assertMenuFocusStatesDOM = (listNode, expectedFocusStates) => {
  assert.deepEqual(Array.from(listNode.childNodes).map(item => item.classList[1] === 'is-focused'), expectedFocusStates);
};

const findInput = tree => tree.find('input');

describe('Autocomplete', () => {
  let clock;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });

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
    let tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two']}>
        <input />
      </Autocomplete>
    );

    findInput(tree).simulate('focus');
    findInput(tree).simulate('change', 'test');

    await nextEventLoopIteration();

    assert.equal(findInput(tree).prop('value'), 'test');

    findInput(tree).simulate('mouseEnter');
    await nextEventLoopIteration();

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

    clock.tick(15); // Wait for async getCompletions
    // Dom needs actual time to pass in order to update, otherwise all we have is updated state
    await nextEventLoopIteration();

    assert.equal(findInput(tree).prop('value'), 'test');

    findInput(tree).simulate('mouseEnter');
    await nextEventLoopIteration();

    assert.equal(tree.childAt(1).prop('show'), true);

    findInput(tree).simulate('mouseEnter');
    await nextEventLoopIteration();
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

    await nextEventLoopIteration(); // Wait for async getCompletions
    findInput(tree).simulate('mouseEnter');
    await nextEventLoopIteration();

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

    await nextEventLoopIteration(); // Wait for async getCompletions
    findInput(tree).simulate('mouseEnter');
    await nextEventLoopIteration();

    // Stub DOM dimensions
    const listNode = document.querySelector('ul');
    const items = listNode.childNodes;
    const stubs = [];
    stubs.push(sinon.stub(listNode, 'clientHeight').get(() => itemHeight * 2));
    stubs.push(sinon.stub(listNode, 'scrollHeight').get(() => itemHeight * items.length));
    items.forEach((item, index) => {
      stubs.push(sinon.stub(item, 'offsetHeight').get(() => itemHeight));
      stubs.push(sinon.stub(item, 'offsetTop').get(() => itemHeight * index));
    });

    assertMenuFocusStatesDOM(listNode, [true, false, false, false, false, false]);

    // Page up/Page down tests rely on offsetTop and clientHeight
    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    assertMenuFocusStatesDOM(listNode, [false, false, true, false, false, false]);

    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    assertMenuFocusStatesDOM(listNode, [false, false, false, false, true, false]);

    findInput(tree).simulate('keyDown', {key: 'PageDown', preventDefault: () => {}});
    assertMenuFocusStatesDOM(listNode, [false, false, false, false, false, true]);

    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});
    assertMenuFocusStatesDOM(listNode, [false, false, false, true, false, false]);

    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});
    assertMenuFocusStatesDOM(listNode, [false, true, false, false, false, false]);

    findInput(tree).simulate('keyDown', {key: 'PageUp', preventDefault: () => {}});
    assertMenuFocusStatesDOM(listNode, [true, false, false, false, false, false]);

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

    await nextEventLoopIteration(); // Wait for async getCompletions

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

    await nextEventLoopIteration(); // Wait for async getCompletions

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

    await nextEventLoopIteration(); // Wait for async getCompletions

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

    await nextEventLoopIteration(); // Wait for async getCompletions
    tree.update();

    assert.equal(tree.childAt(1).prop('show'), true);

    await nextEventLoopIteration(); // wait for async getCompletions
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

    await nextEventLoopIteration(); // Wait for async getCompletions
    tree.update();

    assert.equal(tree.childAt(1).prop('show'), true);

    await nextEventLoopIteration(); // Wait for async getCompletions
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

    await nextEventLoopIteration(); // Wait for async getCompletions

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

    await nextEventLoopIteration(); // Wait for async getCompletions

    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete is-focused');
    assert.equal(tree.find(Menu).length, 1);

    findInput(tree).simulate('blur');
    assert.equal(tree.prop('className'), 'react-spectrum-Autocomplete');
    assert.equal(tree.childAt(1).prop('show'), false);
  });

  it('supports a controlled value mode', async () => {
    const onChange = sinon.spy();
    const onSelect = sinon.spy();

    const tree = shallow(
      <Autocomplete value="foo" onChange={onChange} onSelect={onSelect} getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    assert.equal(findInput(tree).prop('value'), 'foo');

    findInput(tree).simulate('change', 'test');

    await nextEventLoopIteration();

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], 'test');
    assert.equal(onSelect.callCount, 0);

    // It doesn't change the value in controlled mode
    assert.equal(findInput(tree).prop('value'), 'foo');

    findInput(tree).simulate('keyDown', {key: 'ArrowDown', altKey: true, preventDefault: function () {}});
    // wait for the menu to open and verify it's open
    await nextEventLoopIteration();
    assert.equal(tree.find(Overlay).props().show, true);
    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: function () {}});
    findInput(tree).simulate('keyDown', {key: 'Enter', preventDefault: function () {}});
    // once a selection has been made, verify that the overlay closed
    assert.equal(tree.find(Overlay).props().show, false);

    assert.equal(onChange.callCount, 2);
    assert.deepEqual(onChange.getCall(1).args[0], 'one');

    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'one');
    // verify that the value is still 'foo' after the menu close
    assert.equal(findInput(tree).prop('value'), 'foo');
  });

  it('supports a controlled show menu:false mode', async () => {
    const tree = shallow(
      <Autocomplete value="foo" showMenu={false} getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    assert.equal(findInput(tree).prop('value'), 'foo');
    await nextEventLoopIteration();
    assert.equal(tree.find(Overlay).props().show, false);
    tree.simulate('change', 'tw');
    await nextEventLoopIteration();
    assert.equal(tree.find(Overlay).props().show, false);
  });

  it('supports a controlled show menu:true mode', async () => {
    const onChange = sinon.spy();
    const onSelect = sinon.spy();

    const tree = shallow(
      <Autocomplete value="foo" onChange={onChange} onSelect={onSelect} showMenu getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );

    assert.equal(findInput(tree).prop('value'), 'foo');
    await nextEventLoopIteration();
    assert.equal(tree.find(Overlay).props().show, true);
    findInput(tree).simulate('keyDown', {key: 'ArrowDown', preventDefault: function () {}});
    findInput(tree).simulate('keyDown', {key: 'Enter', preventDefault: function () {}});
    // once a selection has been made, verify that the overlay closed
    assert.equal(tree.find(Overlay).props().show, true);

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], 'two');

    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'two');
    // verify that the value is still 'foo' after the menu close
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

    await nextEventLoopIteration(); // Wait for async getCompletions

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
    let onMenuToggle = sinon.spy();
    const tree = shallow(
      <Autocomplete onMenuToggle={onMenuToggle} getCompletions={v => ['one', 'two', 'three']}>
        <input />
      </Autocomplete>
    );
    let showMenuResolver = null;
    let showMenuPromise = new Promise(resolve => showMenuResolver = resolve);
    let showMenu = tree.instance().showMenu;
    sinon.stub(tree.instance(), 'showMenu').callsFake(async () => {
      await showMenu();
      showMenuResolver();
    });
    let hideMenuResolver = null;
    let hideMenuPromise = new Promise(resolve => hideMenuResolver = resolve);
    let hideMenu = tree.instance().hideMenu;
    sinon.stub(tree.instance(), 'hideMenu').callsFake(async () => {
      await hideMenu();
      hideMenuResolver();
    });

    assert(!onMenuToggle.called);
    tree.instance().toggleMenu();

    await showMenuPromise;
    assert(onMenuToggle.calledOnce);
    assert.equal(onMenuToggle.getCall(0).args[0], true);
    tree.update();
    assert.equal(tree.childAt(1).prop('show'), true);

    tree.instance().toggleMenu();

    await hideMenuPromise;
    assert(onMenuToggle.calledTwice);
    assert.equal(onMenuToggle.getCall(1).args[0], false);
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

    await nextEventLoopIteration();

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
    await nextEventLoopIteration();
    assert.equal(tree.instance().state.width, stubWidth);
    assert.equal(tree.instance().menu.props.style.width, stubWidth + 'px');

    // restore original offsetWidth getter
    stub.restore();
    tree.unmount();
  });

  it('should show a checkmark on the currently selected menu item', async () => {
    const tree = shallow(
      <Autocomplete getCompletions={v => ['one', 'two']}>
        <input />
      </Autocomplete>
    );

    tree.find('input').simulate('focus');
    tree.find('input').simulate('change', 'two');

    await nextEventLoopIteration(); // Wait for async getCompletions
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

      await nextEventLoopIteration();

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

      await nextEventLoopIteration(); // Wait for async getCompletions
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
