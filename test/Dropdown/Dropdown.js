import assert from 'assert';
import Dropdown from '../../src/Dropdown';
import Button from '../../src/Button';
import {Menu, MenuItem} from '../../src/Menu';
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

    assert.equal(tree.find(Button).length, 1);
    assert(tree.find(Button).prop('onClick'));
    assert.equal(tree.find(Menu).length, 0);
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

    assert.equal(tree.find(Button).length, 1);
    assert(tree.find(Button).prop('onClick'));
    assert(tree.children().find('div').length, 1);
    assert.equal(tree.find(Menu).length, 0);
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
    assert(!tree.find(Button).prop('onClick'));
    assert(tree.children().find('div').length, 1);
    assert(tree.children().find('div').prop('onClick'));
    assert.equal(tree.find(Menu).length, 0);
  });

  it('toggles menu on click', function () {
    const tree = shallow(
      <Dropdown>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    assert.equal(tree.find(Menu).length, 0);

    tree.find(Button).simulate('click');
    assert.equal(tree.find(Menu).length, 1);
    assert.equal(tree.find(Menu).prop('className'), 'coral-Dropdown-menu');

    tree.find(Button).simulate('click');
    assert.equal(tree.find(Menu).length, 0);
  });

  it('closes the menu onClose', function () {
    const spy = sinon.spy();
    const tree = shallow(
      <Dropdown onClose={spy}>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    assert.equal(tree.find(Menu).length, 0);

    tree.find(Button).simulate('click');
    assert.equal(tree.find(Menu).length, 1);

    tree.find(Menu).simulate('close');
    assert.equal(tree.find(Menu).length, 0);

    assert.equal(spy.callCount, 1);
  });

  it('closes the menu onSelect', function () {
    const onClose = sinon.spy();
    const onSelect = sinon.spy();
    const tree = shallow(
      <Dropdown onClose={onClose} onSelect={onSelect}>
        <Button>Test</Button>
        <Menu>
          <MenuItem>Test</MenuItem>
        </Menu>
      </Dropdown>
    );

    assert.equal(tree.find(Menu).length, 0);

    tree.find(Button).simulate('click');
    assert.equal(tree.find(Menu).length, 1);

    tree.find(Menu).simulate('select', 'test');
    assert.equal(tree.find(Menu).length, 0);

    assert.equal(onClose.callCount, 1);
    assert.equal(onSelect.callCount, 1);
    assert.equal(onSelect.getCall(0).args[0], 'test');
  });
});
