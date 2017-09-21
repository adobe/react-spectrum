import assert from 'assert';
import Button from '../../src/Button';
import Dropdown from '../../src/Dropdown';
import {Menu, MenuItem} from '../../src/Menu';
import OverlayTrigger from '../../src/OverlayTrigger';
import React from 'react';
import {shallow} from 'enzyme';
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
});
