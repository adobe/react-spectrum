import assert from 'assert';
import CoachMark from '../../src/CoachMark';
import {mount} from 'enzyme';
import Portal from 'react-overlays/lib/Portal';
import Provider from '../../src/Provider';
import React from 'react';
import sinon from 'sinon';

describe('CoachMark', () => {
  let tree;
  let clock;
  let mountNode;

  beforeEach(() => {
    mountNode = document.createElement('DIV');
    document.body.appendChild(mountNode);
    clock = sinon.useFakeTimers();
  });
  afterEach(() => {
    tree.detach();
    tree = null;
    clock.restore();
    document.body.removeChild(mountNode);
  });
  it('Should contain an overlay trigger shown', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    // need to mount to a real node so that we can perform clicks and use the jsdom events
    tree = mount(
      <CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" />,
      {attachTo: mountNode}
    );
    assert.equal(tree.find(CoachMark).find(Portal).length, 1);
        /**
         * when 15 support is dropped, change back to:
         * assert.equal(tree.find(CoachMarkIndicator).length, 1);
         * assert.equal(tree.find(OverlayTrigger).props().defaultShow, true);
         * assert.equal(tree.find(OverlayTrigger).props().show, true);
         */
    assert.equal(document.querySelectorAll('.spectrum-CoachMarkIndicator').length, 1);

    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);

    tree.find(CoachMark).instance().onHide();
    assert(onHide.called); // onHide didn't do anything other than call the prop we passed in
    clock.tick(125);

    // this should by default stay open regardless of activity
    document.querySelectorAll('.spectrum-CoachMarkIndicator')[0].click();
    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);
    assert(!onHide.calledTwice);

    document.body.click();
    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);
    assert(!onHide.calledTwice);
  });

  it('should be dismissible', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    tree = mount(
      <Provider><CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" dismissible /></Provider>,
      {attachTo: mountNode}
    );

    document.querySelectorAll('.spectrum-CoachMarkIndicator')[0].click();
    assert(onHide.calledOnce);
    tree.update();
    clock.tick(125);
    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 0);

    document.querySelectorAll('.spectrum-CoachMarkIndicator')[0].click();
    assert(!onHide.calledTwice);
    tree.update();
    clock.tick(125);
    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);
  });

  it('only responds to the coach mark indicator being positioned once', async () => {
    tree = mount(
      <CoachMark title="Hello world" selector="#something" confirmLabel="confirm" />,
      {attachTo: mountNode}
    );
    let component = tree.instance();
    assert(component.shouldUpdatePosition);
    assert(!tree.state().indicatorPositioned);

    let originalRender = component.render.bind(component);
    let renderSpy = sinon.stub(component, 'render').callsFake(() => {
      assert(component.shouldUpdatePosition);
      assert(tree.state().indicatorPositioned);
      return originalRender();
    });
    component.onIndicatorPositioned();
    assert(renderSpy.called);
    renderSpy.restore();

    assert(!component.shouldUpdatePosition);
    assert(tree.state().indicatorPositioned);

    renderSpy = sinon.stub(component, 'render').callsFake(() => {
      assert(!component.shouldUpdatePosition);
      assert(tree.state().indicatorPositioned);
      return originalRender();
    });
    component.onIndicatorPositioned();
    renderSpy.restore();
  });
});
