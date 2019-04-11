import assert from 'assert';
import Button from '../../src/Button/js/Button';
import {mount} from 'enzyme';
import OverlayTrigger from '../../src/OverlayTrigger/js/OverlayTrigger';
import Popover from '../../src/Popover/js/Popover';
import React from 'react';
import ReactDOM from 'react-dom';
import sinon from 'sinon';
import Tooltip from '../../src/Tooltip/js/Tooltip';

describe('OverlayTrigger', () => {
  describe('non window behaviors', () => {
    let tree;
    let clock;
    beforeEach(() => {
      clock = sinon.useFakeTimers();
    });
    afterEach(() => {
      if (tree) {
        tree.unmount();
        tree = null;
      }
      clock.runAll();
      clock.restore();
    });
    it('should support lastFocus prop', () => {
      let lastFocus = {
        focus: sinon.spy()
      };
      let onClickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={onClickSpy} trigger="click">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );

      // open overlay by clicking the trigger element
      tree.find(Button).getDOMNode().focus();
      tree.find(Button).simulate('click');
      clock.tick(50);

      assert.equal(tree.instance().rememberedFocus(), tree.find(Button).getDOMNode());
      assert(onClickSpy.calledOnce);
      assert(tree.state('show'));
      assert.equal(document.querySelector('.spectrum-Popover'), document.activeElement);

      // set lastFocus prop using stub
      tree.setProps({lastFocus});
      assert.equal(tree.instance().rememberedFocus(), lastFocus);
      tree.find(Button).simulate('click');
      clock.tick(125);

      assert(onClickSpy.calledTwice);
      assert(!tree.state('show'));
      assert(lastFocus.focus.called);
    });

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
      let longClickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} onLongClick={longClickSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('mouseDown', {button: 0});
      clock.tick(250);
      assert(tree.state('show'));
      assert(!clickSpy.called);
      assert(longClickSpy.calledOnce);
      button.simulate('mouseUp', {button: 0});
      assert(tree.state('show'));
      assert(!clickSpy.called);
      assert(longClickSpy.calledOnce);
    });

    it('does not call long click prop if the mouse is lifted before the timeout', () => {
      let clickSpy = sinon.spy();
      let longClickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} onLongClick={longClickSpy} trigger="longClick">
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
      assert(!longClickSpy.called);
    });

    it('opens using keyboard event, ArrowDown + Alt', () => {
      let clickSpy = sinon.spy();
      let longClickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} onLongClick={longClickSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('keyDown', {key: 'ArrowDown', altKey: true});
      assert(tree.state('show'));
      assert(!clickSpy.called);
      assert(!longClickSpy.called);
    });

    it('opens using keyboard event, Down + Alt', () => {
      let clickSpy = sinon.spy();
      let longClickSpy = sinon.spy();
      tree = mount(
        <OverlayTrigger onClick={clickSpy} onLongClick={longClickSpy} trigger="longClick">
          <Button>Click me</Button>
          <Popover>Popover</Popover>
        </OverlayTrigger>
      );
      let button = tree.find(Button);
      button.simulate('keyDown', {key: 'Down', altKey: true});
      assert(tree.state('show'));
      assert(!clickSpy.called);
      assert(!longClickSpy.called);
    });
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

    it('does not open if mouseout and mouseup before the timeout', () => {
      let clickSpy = sinon.spy();
      let longClickSpy = sinon.spy();
      tree = mount(
        <div>
          <OverlayTrigger onClick={clickSpy} onLongClick={longClickSpy} trigger="longClick">
            <Button>Click me</Button>
            <Popover>Popover</Popover>
          </OverlayTrigger>
          <div className="externalTarget">external</div>
        </div>,
        {attachTo: mountNode}
      );
      let overlayTrigger = tree.find(OverlayTrigger).instance();
      let button = tree.find(Button);
      let externalTarget = tree.find('.externalTarget');
      button.simulate('mouseDown', {button: 0});
      clock.tick(150);
      button.simulate('mouseOut');
      clock.tick(50);
      ReactDOM.findDOMNode(externalTarget.instance()).dispatchEvent(new MouseEvent('mouseUp', {button: 0, bubbles: true}));
      assert(!overlayTrigger.state.show);
      assert(!clickSpy.called);
      assert(!longClickSpy.calledOnce);
      clock.tick(50); // got to end of timeout and make sure we still don't show
      assert(!overlayTrigger.state.show);
      assert(!clickSpy.called);
      assert(!longClickSpy.calledOnce);
    });

    it('opens if mouseout before timeout and mouseup after the timeout', () => {
      let clickSpy = sinon.spy();
      let longClickSpy = sinon.spy();
      tree = mount(
        <div>
          <OverlayTrigger onClick={clickSpy} onLongClick={longClickSpy} trigger="longClick">
            <Button>Click me</Button>
            <Popover>Popover</Popover>
          </OverlayTrigger>
          <div className="externalTarget">external</div>
        </div>,
        {attachTo: mountNode}
      );
      let overlayTrigger = tree.find(OverlayTrigger).instance();
      let button = tree.find(Button);
      let externalTarget = tree.find('.externalTarget');
      button.simulate('mouseDown', {button: 0});
      clock.tick(150);
      button.simulate('mouseOut');
      clock.tick(100);
      ReactDOM.findDOMNode(externalTarget.instance()).dispatchEvent(new MouseEvent('mouseUp', {button: 0, bubbles: true}));
      assert(overlayTrigger.state.show);
      assert(!clickSpy.called);
      assert(longClickSpy.calledOnce);
    });
  });
});
