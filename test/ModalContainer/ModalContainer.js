import assert from 'assert';
import ModalContainer, {Modal} from '../../src/ModalContainer';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('ModalContainer', () => {
  let clock;

  before(() => {
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });

  it('should wrap contents in a modal and call PortalContainer', async () => {
    let content = <div id="modal-test">Contents</div>;
    let key = ModalContainer.show(content);

    let node = document.querySelector('#modal-test');
    assert(node);
    assert.equal(node.previousSibling.className, 'spectrum-Underlay');

    clock.tick(1);

    assert.equal(node.previousSibling.className, 'spectrum-Underlay is-open');

    ModalContainer.hide(key);
    node = document.querySelector('#modal-test');
    assert(!node);
  });

  it('should use "static" for backdrop by default', () => {
    const tree = shallow(<Modal><div id="modal-test">Contents</div></Modal>);
    assert.equal(tree.props().backdrop, 'static');
  });

  it('should use true for backdrop if it hosts a node with backdropClickable: true', () => {
    const tree = shallow(<Modal><div id="modal-test" backdropClickable>Contents</div></Modal>);
    assert.equal(tree.props().backdrop, true);
  });

  it('should use false for backdrop if it hosts a node with fullscreenTakeover: true', () => {
    const tree = shallow(<Modal><div id="modal-test" mode="fullscreenTakeover">Contents</div></Modal>);
    assert.equal(tree.props().backdrop, false);
  });

  it('should use false for backdrop if it hosts a node with fullscreenTakeover: true and backdropClickable: true', () => {
    const tree = shallow(<Modal><div id="modal-test" backdropClickable mode="fullscreenTakeover">Contents</div></Modal>);
    assert.equal(tree.props().backdrop, false);
  });

  it('should move focus to modal on show and restore focus to the last focused element on hide', () => {
    const tree = mount(<button>Last focus</button>);

    // set focus to a trigger element
    const triggerNode = tree.getDOMNode();
    triggerNode.focus();
    assert.equal(document.activeElement, triggerNode);

    // create and show a modal
    let content = <div id="modal-test">Contents</div>;
    let key = ModalContainer.show(content);

    // focus should be set to modal
    let node = document.querySelector('#modal-test');
    assert.equal(document.activeElement, node);

    // hide the modal
    ModalContainer.hide(key);

    // focus should be restored to the trigger element
    assert.equal(document.activeElement, triggerNode);
    tree.unmount();
  });

  describe('Accessibility', () => {
    it('should have role="dialog" when child has no role', async () => {
      let content = <div id="modal-test">Contents</div>;
      let key = ModalContainer.show(content);

      let node = document.querySelector('#modal-test');
      assert(node);
      assert.equal(node.previousSibling.className, 'spectrum-Underlay');

      clock.tick(1);

      assert.equal(node.previousSibling.className, 'spectrum-Underlay is-open');
      assert.equal(node.parentElement.getAttribute('role'), 'dialog');

      ModalContainer.hide(key);
      node = document.querySelector('#modal-test');
      assert(!node);
    });

    it('should have role="presentation" when child has role="dialog"', async () => {
      let content = <div id="modal-test" role="dialog">Contents</div>;
      let key = ModalContainer.show(content);

      let node = document.querySelector('#modal-test');
      assert(node);
      assert.equal(node.previousSibling.className, 'spectrum-Underlay');

      clock.tick(1);

      assert.equal(node.previousSibling.className, 'spectrum-Underlay is-open');
      assert.equal(node.parentElement.getAttribute('role'), 'presentation');

      ModalContainer.hide(key);
      node = document.querySelector('#modal-test');
      assert(!node);
    });
  });

  it('should hide with Escape key', async () => {
    const tree = mount(<button>Last focus</button>);

    // set focus to a trigger element
    const triggerNode = tree.getDOMNode();
    triggerNode.focus();
    assert.equal(document.activeElement, triggerNode);

    let content = <div id="modal-test" role="dialog">Contents</div>;
    ModalContainer.show(content);

    // focus should be set to modal
    let node = document.querySelector('#modal-test');
    assert.equal(document.activeElement, node);

    let event = new window.KeyboardEvent('keydown', {
      key: 'Escape',
      keyCode: 27,
      which: 27
    });

    node.ownerDocument.dispatchEvent(event);

    // wait for fade out and ensure that focus is restored to trigger element
    clock.tick(125);

    assert.equal(document.activeElement, triggerNode);
    node = document.querySelector('#modal-test');
    assert(!node);

    tree.unmount();
  });
});
