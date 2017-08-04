import assert from 'assert';
import ModalContainer from '../../src/ModalContainer';
import React from 'react';

describe('ModalContainer', () => {
  it('should wrap contents in a modal and call PortalContainer', () => {
    let content = <div id="modal-test">Contents</div>;
    let key = ModalContainer.show(content);

    let node = document.querySelector('#modal-test');
    assert(node);
    assert.equal(node.parentNode.className, 'coral3-modal');
    assert.equal(node.previousSibling.className, 'coral3-Backdrop');

    ModalContainer.hide(key);
    node = document.querySelector('#modal-test');
    assert(!node);
  });
});
