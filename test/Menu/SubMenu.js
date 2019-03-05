import assert from 'assert';
import {Menu, MenuItem, SubMenu} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

const rAF = requestAnimationFrame;

const render = (props = {}) => shallow(
  <SubMenu {...props}>
    <MenuItem>Menu Item 1</MenuItem>
    <MenuItem>Menu Item 2</MenuItem>
  </SubMenu>
  );

describe('SubMenu', () => {

  it('has correct defaults', () => {
    const tree = render();
    assert.equal(tree.prop('placement'), 'right top');
  });

  it('renders an overlayTrigger', function () {
    let tree = render();
    let overlayTrigger = tree.find('OverlayTrigger');
    assert.equal(overlayTrigger.length, 1);
  });

  it('menuItem is trigger for overlay', function () {
    let tree = render();
    let overlayTrigger = tree.find('OverlayTrigger');
    assert.equal(overlayTrigger.childAt(0).type(), MenuItem);
    assert.equal(tree.find('OverlayTrigger').find(Menu).length, 1);
  });

  it('Submenu is opened on trigger', function (done) {
    let tree = mount(
      <SubMenu>
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
      </SubMenu>
      );
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
    tree.find('li').simulate('mouseenter');
    rAF(() => {
      assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
      assert(document.querySelector('.spectrum-Popover .spectrum-Menu'));
      tree.unmount();
      done();
    });
  });

  it('should hide on mouseleave', () => {
    let clock = sinon.useFakeTimers();

    let tree = mount(
      <SubMenu>
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
      </SubMenu>
    );

    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);

    const menuItem = tree.find('li');

    menuItem.simulate('mouseenter');
    clock.tick(250); // wait for animation
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
    assert(document.querySelector('.spectrum-Popover .spectrum-Menu'));

    menuItem.simulate('mouseleave');
    clock.tick(250); // wait for animation
    assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
    assert(!document.querySelector('.spectrum-Popover .spectrum-Menu'));

    clock.restore();

    tree.unmount();
  });

  describe('Accessibility', () => {

    it('aria-haspopup is set to as menu', function () {
      let tree = render();
      assert.equal(tree.find('OverlayTrigger').find(MenuItem).at(0).prop('aria-haspopup'), 'menu');
    });

    it('aria-expanded is set to correct value', function (done) {
      let tree = mount(
        <SubMenu>
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </SubMenu>
        );
      assert.equal(document.querySelectorAll('.spectrum-Popover').length, 0);
      assert.equal(tree.find('MenuItem').getDOMNode().getAttribute('aria-expanded'), 'false');
      tree.find('li').simulate('mouseenter');

      rAF(() => {
        assert.equal(document.querySelectorAll('.spectrum-Popover').length, 1);
        assert.equal(tree.find('MenuItem').getDOMNode().getAttribute('aria-expanded'), 'true');
        tree.unmount();
        done();
      });
    });

    it('aria-owns and aria-labelledby are set correct', function (done) {
      let tree = mount(
        <SubMenu trigger="click">
          <MenuItem>Menu Item 1</MenuItem>
          <MenuItem>Menu Item 2</MenuItem>
        </SubMenu>
        );
      tree.find('li').simulate('mouseenter');
      rAF(() => {
        const parentMenuItem = tree.find('li');
        const childMenu = document.querySelector('.spectrum-Popover .spectrum-Menu');
        assert.equal(parentMenuItem.prop('aria-owns'), childMenu.id);
        assert.equal(parentMenuItem.prop('id'), childMenu.getAttribute('aria-labelledby'));
        tree.unmount();
        done();
      });
    });
  });

});
