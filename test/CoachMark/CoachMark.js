import assert from 'assert';
import CoachMark from '../../src/CoachMark';
import CoachMarkIndicator from '../../src/CoachMark/js/CoachMarkIndicator';
import {mount} from 'enzyme';
import OverlayTrigger from '../../src/OverlayTrigger';
import Portal from 'react-overlays/lib/Portal';
import React from 'react';
import sinon from 'sinon';

describe('CoachMark', () => {
  it('Should contain an overlay trigger shown', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    const tree = mount(<CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" />);

    assert.equal(tree.find(CoachMark).find(Portal).length, 1);
    assert.equal(tree.find(CoachMarkIndicator).length, 1);
    assert.equal(tree.find(OverlayTrigger).props().defaultShow, true);
    assert.equal(tree.find(OverlayTrigger).props().show, true);

    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);

    tree.instance().onHide();
    assert(onHide.called);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, false);
    tree.unmount();
  });
  it('Should show and hide in an uncontrolled manner', async () => {
    let onHide = sinon.spy();
    // need to mount because there is a ref that determines the container for the portal
    const tree = mount(<CoachMark onHide={onHide} title="Hello world" selector="#something" confirmLabel="confirm" />);

    assert.equal(tree.find(CoachMark).find(Portal).length, 1);
    assert.equal(tree.find(CoachMarkIndicator).length, 1);
    assert.equal(tree.find(OverlayTrigger).props().defaultShow, true);
    assert.equal(tree.find(OverlayTrigger).props().show, true);

    assert.equal(document.querySelectorAll('.spectrum-CoachMarkPopover').length, 1);

    tree.instance().onClickIndicator();
    assert(!onHide.called);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, false);
    tree.instance().onClickIndicator();
    assert(!onHide.called);
    tree.update();
    assert.equal(tree.find(OverlayTrigger).props().show, true);
    tree.unmount();
  });
  it('only responds to the coach mark indicator being positioned once', async () => {
    let tree = mount(<CoachMark title="Hello world" selector="#something" confirmLabel="confirm" />);
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

    tree.unmount();
  });
});
