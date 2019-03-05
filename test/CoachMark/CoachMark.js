import assert from 'assert';
import CoachMark from '../../src/CoachMark';
import CoachMarkIndicator from '../../src/CoachMark/js/CoachMarkIndicator';
import {mount} from 'enzyme';
import OverlayTrigger from '../../src/OverlayTrigger';
import Portal from 'react-overlays/lib/Portal';
import React from 'react';
import sinon from 'sinon';

describe('CoachMark', () => {
  let tree;
  afterEach(() => {
    tree.unmount();
    tree = null;
  });
  it('Should contain an overlay trigger shown', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    tree = mount(<CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" />);

    assert.equal(tree.find(CoachMark).find(Portal).length, 1);
    assert.equal(tree.find(CoachMarkIndicator).length, 1);
    assert.equal(tree.find(OverlayTrigger).props().defaultShow, true);
    assert.equal(tree.find(OverlayTrigger).props().show, true);

    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);

    tree.instance().onHide(); // asserts that the prop gets called, not that we actually hid anything
    assert(onHide.called);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, true);
  });

  it('should be dismissible', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    tree = mount(
      <CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" dismissible />
    );

    assert.equal(tree.find(CoachMark).props().dismissible, true);
    assert.equal(tree.find(CoachMark).find(Portal).length, 1);
    assert.equal(tree.find(CoachMarkIndicator).length, 1);
    assert.equal(tree.find(OverlayTrigger).props().defaultShow, true);
    assert.equal(tree.find(OverlayTrigger).props().show, undefined);

    tree.find(CoachMarkIndicator).simulate('click');
    assert(onHide.calledOnce);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, undefined);

    tree.find(CoachMarkIndicator).simulate('click');
    assert(!onHide.calledTwice);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, undefined);
  });

  it('should not show/hide if not dismissible', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    tree = mount(<CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" />);

    assert.equal(tree.find(CoachMark).find(Portal).length, 1);
    assert.equal(tree.find(CoachMarkIndicator).length, 1);
    assert.equal(tree.find(OverlayTrigger).props().defaultShow, true);
    assert.equal(tree.find(OverlayTrigger).props().show, true);

    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);

    tree.find(CoachMarkIndicator).simulate('click');
    assert(!onHide.called);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, true);
  });

  it('only responds to the coach mark indicator being positioned once', async () => {
    tree = mount(<CoachMark title="Hello world" selector="#something" confirmLabel="confirm" />);
    assert(tree.instance().shouldUpdatePosition);
    assert(!tree.state().indicatorPositioned);

    let originalRender = tree.instance().render;
    let renderSpy = sinon.stub(tree.instance(), 'render').callsFake(() => {
      assert(tree.instance().shouldUpdatePosition);
      assert(tree.state().indicatorPositioned);
      return originalRender();
    });
    tree.instance().onIndicatorPositioned();
    assert(renderSpy.called);
    renderSpy.restore();

    assert(!tree.instance().shouldUpdatePosition);
    assert(tree.state().indicatorPositioned);

    renderSpy = sinon.stub(tree.instance(), 'render').callsFake(() => {
      assert(!tree.instance().shouldUpdatePosition);
      assert(tree.state().indicatorPositioned);
      return originalRender();
    });
    tree.instance().onIndicatorPositioned();
    renderSpy.restore();
  });
});
