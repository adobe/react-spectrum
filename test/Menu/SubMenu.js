/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import {Menu, MenuItem, SubMenu} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import OverlayTrigger from '../../src/OverlayTrigger';
import React from 'react';
import sinon from 'sinon';

const render = (props = {}) => shallow(
  <SubMenu {...props}>
    <MenuItem>Menu Item 1</MenuItem>
    <MenuItem>Menu Item 2</MenuItem>
  </SubMenu>
  );

describe('SubMenu', () => {
  let clock;
  let tree;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.runAll();
    clock.restore();
  });

  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });

  it('has correct defaults', () => {
    const tree = render();
    assert.equal(tree.prop('placement'), 'right top');
  });

  it('renders an overlayTrigger', () => {
    const tree = render();
    assert.equal(tree.find(OverlayTrigger).length, 1);
  });

  it('menuItem is trigger for overlay', () => {
    const tree = render();
    const overlayTrigger = tree.find(OverlayTrigger);
    assert.equal(overlayTrigger.childAt(0).type(), MenuItem);
    assert.equal(overlayTrigger.find(Menu).length, 1);
  });

  it('Submenu is opened on trigger', async () => {
    tree = mount(
      <SubMenu label="Menu Item">
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
      </SubMenu>
      );
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
    tree.find('li').simulate('mouseenter');
    clock.tick(16); // wait for animation
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
    assert(document.querySelector('.spectrum-Popover .spectrum-Menu'));
  });

  it('Submenu is opened on click', async () => {
    tree = mount(
      <SubMenu label="Menu Item">
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
      </SubMenu>
      );
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
    tree.find('li').simulate('click');
    clock.tick(16);
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
    assert(document.querySelector('.spectrum-Popover .spectrum-Menu'));
  });

  it('should hide on mouseleave', async () => {
    tree = mount(
      <SubMenu label="Menu Item">
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
      </SubMenu>
      );
    tree.setState({opened: true});
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
    assert(document.querySelector('.spectrum-Popover .spectrum-Menu'));
    tree.find('li').simulate('mouseleave');
    clock.tick(250); // wait for animation
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
    assert(!document.querySelector('.spectrum-Popover .spectrum-Menu'));
  });

  it('should call _onNestedSubmenuOpen on show', async () => {
    let spy = sinon.spy();
    tree = mount(
      <SubMenu label="Menu Item" _onNestedSubmenuOpen={spy}>
        <MenuItem>Menu Item 1</MenuItem>
        <SubMenu label="Menu Item 2">
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </SubMenu>
      </SubMenu>
      );
    tree.find('li').simulate('click');
    clock.tick(16);
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
    assert(spy.calledOnce);
    document.querySelectorAll('.spectrum-Popover .spectrum-Menu-item')[1].click();
    clock.tick(16);
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 2);
    assert(spy.calledTwice);
    document.querySelectorAll('.spectrum-Popover .spectrum-Menu-item')[2]
      .dispatchEvent(new window.KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
    clock.tick(250);
    document.querySelectorAll('.spectrum-Popover .spectrum-Menu-item')[1]
      .dispatchEvent(new window.KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
    clock.tick(250);
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
  });

  describe('Accessibility', () => {

    it('aria-haspopup is set to as menu', function () {
      const tree = render();
      assert.equal(tree.find(OverlayTrigger).find(MenuItem).at(0).prop('aria-haspopup'), 'menu');
    });

    it('aria-expanded is set to correct value', async () => {
      tree = mount(
        <SubMenu label="Menu Item">
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </SubMenu>
        );
      assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
      assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
      tree.find('li').simulate('mouseenter');
      clock.tick(16); // wait for animation
      tree.update();
      assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
      assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'true');
      tree.find('li').simulate('mouseleave');
      clock.tick(250); // wait for animation
      tree.update();
      assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
      assert(!document.querySelector('.spectrum-Popover .spectrum-Menu'));
      assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
    });

    it('aria-owns and aria-labelledby are set correct', async () => {
      tree = mount(
        <SubMenu label="Menu Item">
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </SubMenu>
        );
      tree.find('li').simulate('mouseenter');
      clock.tick(16); // wait for animation
      tree.update();
      const childMenu = document.querySelector('.spectrum-Popover .spectrum-Menu');
      assert.equal(tree.find('li').prop('aria-owns'), childMenu.id);
      assert.equal(tree.find('li').prop('id'), childMenu.getAttribute('aria-labelledby'));
      tree.find('li').simulate('mouseleave');
      clock.tick(250); // wait for animation
      tree.update();
      assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
      assert(!document.querySelector('.spectrum-Popover .spectrum-Menu'));
      assert.equal(tree.find('li').prop('aria-owns'), null);
    });

    describe('Keyboard', () => {
      it('Submenu opens with Enter or Space key, and closes with ArrowLeft', async () => {
        const onKeyDownSpy = sinon.spy();
        tree = mount(
          <SubMenu label="Menu Item" onKeyDown={onKeyDownSpy}>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
          </SubMenu>
          );
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
        tree.find('li').simulate('keydown', {key: 'Enter'});
        assert(onKeyDownSpy.calledOnce);
        clock.tick(16); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'true');
        tree.find('li').simulate('keydown', {key: 'ArrowLeft'});
        assert(onKeyDownSpy.calledTwice);
        clock.tick(250); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
        onKeyDownSpy.resetHistory();
        tree.find('li').simulate('keydown', {key: ' '});
        assert(onKeyDownSpy.calledOnce);
        clock.tick(16); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'true');
        tree.find('li').simulate('keydown', {key: 'Left'});
        assert(onKeyDownSpy.calledTwice);
        clock.tick(250); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
      });
      it('Submenu opens with ArrowRight key, and closes with ArrowLeft', async () => {
        const onKeyDownSpy = sinon.spy();
        tree = mount(
          <SubMenu label="Menu Item" onKeyDown={onKeyDownSpy}>
            <MenuItem>Sub Menu Item 1</MenuItem>
            <MenuItem>Sub Menu Item 2</MenuItem>
          </SubMenu>
          );
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
        tree.find('li').simulate('keydown', {key: 'ArrowRight'});
        assert(onKeyDownSpy.calledOnce);
        clock.tick(16); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'true');
        tree.find('li').simulate('keydown', {key: 'ArrowLeft'});
        assert(onKeyDownSpy.calledTwice);
        clock.tick(250); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
        onKeyDownSpy.resetHistory();
        tree.find('li').simulate('keydown', {key: 'Right'});
        assert(onKeyDownSpy.calledOnce);
        clock.tick(16); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'true');
        tree.find('li').simulate('keydown', {key: 'Left'});
        assert(onKeyDownSpy.calledTwice);
        clock.tick(250); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
      });
      it('Submenu closes with ArrowLeft on submenu item', async () => {
        tree = mount(
          <SubMenu label="Menu Item">
            <MenuItem>Sub Menu Item 1</MenuItem>
            <MenuItem>Sub Menu Item 2</MenuItem>
          </SubMenu>
          );
        tree.setState({opened: true});
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'true');
        document.querySelector('.spectrum-Popover .spectrum-Menu-item')
          .dispatchEvent(new window.KeyboardEvent('keydown', {key: 'ArrowLeft', bubbles: true}));
        assert.equal(tree.state('opened'), false);
        clock.tick(250); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
        tree.setState({opened: true});
        document.querySelector('.spectrum-Popover .spectrum-Menu-item')
          .dispatchEvent(new window.KeyboardEvent('keydown', {key: 'Left', bubbles: true}));
        assert.equal(tree.state('opened'), false);
        clock.tick(250); // wait for animation
        tree.update();
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
        assert.equal(tree.find('li').getDOMNode().getAttribute('aria-expanded'), 'false');
      });
    });
  });
});
