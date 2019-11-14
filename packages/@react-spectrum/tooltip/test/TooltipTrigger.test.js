import {ActionButton} from '@react-spectrum/button';
import {cleanup, fireEvent, render, waitForDomChange} from '@testing-library/react';
import {Tooltip, TooltipTrigger} from '../';
import React from 'react';
import {triggerPress} from '@react-spectrum/test-utils';
import {triggerHover} from '@react-spectrum/test-utils';

// TODO: add the test for esc button working after animation loads as well

describe('TooltipTrigger', function () {
  afterEach(cleanup);

  it('triggered by click event', function () {
    let {getByRole, getByTestId} = render(
        <TooltipTrigger type="click">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>contents</Tooltip>
        </TooltipTrigger>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerPress(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

  });


  it('triggered by hover event', function () {
    let {getByRole, getByTestId} = render(
        <TooltipTrigger type="hover">
          <ActionButton>Trigger</ActionButton>
          <Tooltip>contents</Tooltip>
        </TooltipTrigger>
    );

    expect(() => {
      getByRole('tooltip');
    }).toThrow();

    let button = getByRole('button');
    triggerHover(button);

    let tooltip = getByRole('tooltip');
    expect(tooltip).toBeVisible();

  });


  ////////// from v2

  /*
    it('should add aria-describedby to trigger when Overlay is a Tooltip', () => {
      tree = mount(
        <OverlayTrigger trigger="click">
          <Button>Hover me</Button>
          <Tooltip id="foo">Tooltip</Tooltip>
        </OverlayTrigger>
      );
      tree.find(Button).simulate('click');
      assert(tree.state('show'));
      assert.equal(tree.find(Button).getDOMNode().getAttribute('aria-describedby'), 'foo');
      assert.equal(document.querySelector('.spectrum-Tooltip').id, 'foo');
      tree.find(Button).simulate('click');
      assert(!tree.state('show'));
      assert(!tree.find(Button).getDOMNode().hasAttribute('aria-describedby'));
    });

    it('should add aria-describedby to trigger when Overlay is a Tooltip using the tooltip generated id', () => {
      tree = mount(
        <OverlayTrigger trigger="click">
          <Button>Hover me</Button>
          <Tooltip>Tooltip</Tooltip>
        </OverlayTrigger>
      );

      tree.find(Button).simulate('click');
      assert(tree.state('show'));
      assert.equal(tree.find(Button).getDOMNode().getAttribute('aria-describedby'),
        document.querySelector('.spectrum-Tooltip').id);
      tree.find(Button).simulate('click');
      assert(!tree.state('show'));
      assert(!tree.find(Button).getDOMNode().hasAttribute('aria-describedby'));
    });

    it('should support delay', async () => {
      const delay = 10;
      tree = mount(
        <OverlayTrigger trigger="hover" delay={delay}>
          <Button>Click me</Button>
          <Popover trapFocus={false}>Popover</Popover>
        </OverlayTrigger>
      );

      tree.find(Button).simulate('mouseOver');
      assert(!tree.state('show'));
      clock.tick(delay);
      assert(tree.state('show'));
      tree.find(Button).simulate('mouseOut');
      assert(tree.state('show'));

      // test clearTimeout for mouseOut
      clock.tick(delay - 5);
      tree.find(Button).simulate('mouseOver');
      clock.tick(delay);
      assert(tree.state('show'));
      tree.find(Button).simulate('mouseOut');
      clock.tick(delay);
      assert(!tree.state('show'));

      // test clearTimeout for mouseOver
      tree.find(Button).simulate('mouseOver');
      assert(!tree.state('show'));
      clock.tick(delay - 5);
      tree.find(Button).simulate('mouseOut');
      assert(!tree.state('show'));
      clock.tick(delay);
      assert(!tree.state('show'));

      // with no delay show/hide immediately
      tree.setProps({delay: null});
      tree.find(Button).simulate('mouseOver');
      assert(tree.state('show'));
      tree.find(Button).simulate('mouseOut');
      clock.tick(tree.prop('delayHide'));
      assert(!tree.state('show'));
    });

    it('should support delayShow', async () => {
      let delayShow = 10;
      tree = mount(
        <OverlayTrigger trigger="hover" delayShow={delayShow}>
          <Button>Click me</Button>
          <Popover trapFocus={false}>Popover</Popover>
        </OverlayTrigger>
      );

      tree.find(Button).simulate('mouseOver');
      assert(!tree.state('show'));
      clock.tick(delayShow);
      assert(tree.state('show'));
      tree.find(Button).simulate('mouseOut');
      clock.tick(tree.prop('delayHide'));
      assert(!tree.state('show'));

      tree.setProps({delayShow: null});
      tree.find(Button).simulate('mouseOver');
      assert(tree.state('show'));
      const showStub = sinon.spy();
      tree.instance().show = showStub;
      tree.instance().handleDelayedShow();
      assert(tree.state('show'));
      assert(!showStub.called);
    });

    it('should support delayHide', () => {
      let delayHide = 10;
      tree = mount(
        <OverlayTrigger trigger="hover" delayHide={delayHide}>
          <Button>Click me</Button>
          <Popover trapFocus={false}>Popover</Popover>
        </OverlayTrigger>
      );

      tree.find(Button).simulate('mouseOver');
      assert(tree.state('show'));
      tree.find(Button).simulate('mouseOut');
      clock.tick(delayHide);
      assert(!tree.state('show'));

      tree.setProps({delay: 0, delayHide: undefined});
      tree.find(Button).simulate('mouseOver');
      assert(tree.state('show'));
      tree.find(Button).simulate('mouseOut');
      clock.tick(0);
      assert(!tree.state('show'));
      tree.setProps({delayHide, delay: undefined});

      const hideStub = sinon.spy();
      tree.instance().hide = hideStub;
      tree.instance().handleDelayedHide();
      assert(!tree.state('show'));
      assert(!hideStub.called);
    });

    it('disabled prop should hide overlay', () => {
      tree = mount(
        <OverlayTrigger trigger="click">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );

      tree.find(Button).simulate('click');
      assert(tree.state('show'));
      tree.setProps({disabled: true});
      assert(!tree.state('show'));
    });

    it('supports longClicks to open', () => {
      let clickSpy = sinon.spy();
      let preventDefaultSpy = sinon.spy();
      let onShowSpy = sinon.spy();
      let onHideSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} onShow={onShowSpy} onHide={onHideSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('mouseDown', {button: 0});
      clock.tick(250);
      assert(tree.state('show'));
      assert(!clickSpy.called);
      assert(onShowSpy.calledOnce);
      button.simulate('mouseUp', {button: 0, preventDefault: preventDefaultSpy});
      assert(tree.state('show'));
      assert(preventDefaultSpy.calledOnce);
      assert(!clickSpy.called);
      button.simulate('mouseDown', {button: 0});
      clock.tick(125);
      assert(tree.state('show'));
      assert(!clickSpy.called);
      button.simulate('mouseUp', {button: 0, preventDefault: preventDefaultSpy});
      assert(!tree.state('show'));
      assert(preventDefaultSpy.calledOnce);
      assert(clickSpy.called);
      assert(onHideSpy.calledOnce);
    });

    it('does not call long click prop if the mouse is lifted before the timeout', () => {
      let clickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('mouseDown', {button: 0});
      clock.tick(125);
      assert(!tree.state('show'));
      button.simulate('mouseUp', {button: 0});
      assert(!tree.state('show'));
      assert(clickSpy.called);
    });

    it('opens using keyboard event, ArrowDown + Alt', () => {
      let clickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('keyDown', {key: 'ArrowDown', altKey: true});
      assert(tree.state('show'));
      assert(!clickSpy.called);
    });

    it('opens using keyboard event, Down + Alt', () => {
      let clickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('keyDown', {key: 'Down', altKey: true});
      assert(tree.state('show'));
      assert(!clickSpy.called);
    });
*/

});
