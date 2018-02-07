import assert from 'assert';
import {Modal} from '../../src/ModalContainer';
import ModalContainer from '../../src/ModalContainer';
import React from 'react';
import {shallow} from 'enzyme';

describe('ModalContainer', () => {
  it('should wrap contents in a modal and call PortalContainer', () => {
    let content = <div id="modal-test" backdropEnabled>Contents</div>;
    let key = ModalContainer.show(content);

    let node = document.querySelector('#modal-test');
    assert(node);
    assert.equal(node.previousSibling.className, 'spectrum-Underlay is-open');

    ModalContainer.hide(key);
    node = document.querySelector('#modal-test');
    assert(!node);
  });
  it('should use "static" for backdrop if it hosts a node with backdropEnabled: true', () => {
    const tree = shallow(<Modal><div id="modal-test">Contents</div></Modal>);
    assert.equal(tree.props().backdrop, 'static');
  });
  it('should use true for backdrop if it hosts a node with backdropEnabled: true and backdropClickable: true', () => {
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
});
