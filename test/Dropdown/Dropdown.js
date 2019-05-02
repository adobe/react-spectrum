import assert from 'assert';
import Button from '../../src/Button';
import Dropdown from '../../src/Dropdown';
import {Menu, MenuItem} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import OverlayTrigger from '../../src/OverlayTrigger';
import React from 'react';
import sinon from 'sinon';

describe('Dropdown', function () {
  it('renders a target', function () {
    const tree = shallow(
      <Dropdown>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    assert.equal(tree.find(OverlayTrigger).length, 1);
    assert.equal(tree.find(OverlayTrigger).find(Button).length, 1);
    assert.equal(tree.find(OverlayTrigger).find(Menu).length, 1);
  });

  it('renders other children', function () {
    const tree = shallow(
      <Dropdown>
        <Button>Test</Button>
        <div />
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    assert.equal(tree.find(OverlayTrigger).find(Button).length, 1);
    assert(tree.children().find('div').length, 1);
    assert.equal(tree.find(OverlayTrigger).length, 1);
  });

  it('allows any child to be the trigger', function () {
    const tree = shallow(
      <Dropdown>
        <Button>Test</Button>
        <div dropdownTrigger />
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    assert.equal(tree.find(Button).length, 1);
    assert.equal(tree.find(OverlayTrigger).find(Button).length, 0);
    assert(tree.find(OverlayTrigger).find('div').length, 1);
    assert.equal(tree.find(OverlayTrigger).find(Menu).length, 1);
  });

  it('closes the menu onClose', function () {
    const spy = sinon.spy();
    const tree = shallow(
      <Dropdown>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    tree.instance().overlayTrigger = {
      hide: spy
    };

    tree.find(Menu).simulate('close');
    assert.equal(spy.callCount, 1);
  });

  it('closes the menu onSelect', function () {
    const onClose = sinon.spy();
    const onSelect = sinon.spy();
    const tree = shallow(
      <Dropdown onSelect={onSelect}>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    tree.instance().overlayTrigger = {
      hide: onClose
    };

    tree.find(Menu).simulate('select', 'test');

    assert.equal(onClose.callCount, 1);
    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'test');
  });

  it('menu remains open onSelect when closeOnSelect set to false', function () {
    const onClose = sinon.spy();
    const onSelect = sinon.spy();
    const tree = shallow(
      <Dropdown onSelect={onSelect} closeOnSelect={false}>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    tree.instance().overlayTrigger = {
      hide: onClose
    };

    tree.find(Menu).simulate('select', 'test');

    assert.equal(onClose.callCount, 0);
    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'test');
  });

  it('calls onOpen and onClose', function () {
    const onOpen = sinon.spy();
    const onClose = sinon.spy();

    const tree = shallow(
      <Dropdown onOpen={onOpen} onClose={onClose}>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    tree.find(OverlayTrigger).simulate('show');
    assert.equal(onOpen.callCount, 1);

    tree.find(OverlayTrigger).simulate('hide');
    assert.equal(onClose.callCount, 1);
  });

  it('aria-expanded is set correctly after open/close', function () {

    const tree = shallow(
      <Dropdown>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    // After a click we expand the list -  aria-expanded should be true.
    tree.find(OverlayTrigger).simulate('show');
    assert.equal(tree.find(Button).prop('aria-expanded'), true);

    // Ensure that aria-expanded gets removed when we click to collapse the list. Prop should return null.
    tree.find(OverlayTrigger).simulate('hide');
    assert.equal(tree.find(Button).prop('aria-expanded'), null);
  });
  describe('window behaviors', () => {
    let tree;
    let clock;
    let mountNode;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      mountNode = document.createElement('DIV');
      document.body.appendChild(mountNode);
    });

    afterEach(() => {
      if (tree) {
        tree.detach();
        tree = null;
      }
      clock.runAll();
      clock.restore();
      document.body.removeChild(mountNode);
      mountNode = null;
    });

    it('supports longClick', () => {
      let selectSpy = sinon.spy();
      let clickSpy = sinon.spy();
      tree = mount(
        <Dropdown onSelect={selectSpy} onClick={clickSpy} trigger="longClick">
          <Button holdAffordance>Click me</Button>
          <Menu>
            <MenuItem>Test</MenuItem>
          </Menu>
        </Dropdown>,
        {attachTo: mountNode}
      );
      let button = tree.find(Button);
      assert(button.props().holdAffordance);
      let overlayTrigger = tree.find(OverlayTrigger).instance();
      button.simulate('mouseDown', {button: 0});
      clock.tick(250);
      button.simulate('mouseUp', {button: 0});
      assert(overlayTrigger.state.show);

      assert.equal(document.querySelectorAll('.spectrum-Menu-item').length, 1);
      document.querySelectorAll('.spectrum-Menu-item')[0].click();

      assert(!clickSpy.called);
      assert(selectSpy.calledOnce);
      assert(!overlayTrigger.state.show);
    });
  });
});
