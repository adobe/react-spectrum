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

import {addToast, error, help, info, removeToast, success, Toast, ToastContainer, warning} from '../../src/Toast';
import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
import {setToastPlacement} from '../../src/Toast/js/state';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('ToastContainer', () => {
  // This is a hack to clean up toast containers after they are rendered and assertions are made.
  const cleanup = () => {
    const nodes = document.querySelectorAll('.react-spectrum-ToastContainer');
    Array.prototype.forEach.call(nodes, node => {
      node.parentNode.removeChild(node);
    });
  };

  it('should render toasts', () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.prop('className'), 'react-spectrum-ToastContainer react-spectrum-ToastContainer--top react-spectrum-ToastContainer--center');
    assert.equal(tree.children().length, 0);

    const toast = <Toast>Test</Toast>;
    tree.instance().add(toast);
    tree.update();
    assert.equal(tree.children().length, 1);

    tree.instance().remove(toast);
    tree.update();
    assert.equal(tree.children().length, 0);

    cleanup();
  });

  it('should render toasts', async () => {
    const tree = shallow(<ToastContainer />);
    const toast = <Toast>Test</Toast>;
    tree.instance().add(toast);
    tree.update();
    assert.equal(tree.children().length, 1);

    await sleep(6);
    tree.instance().remove(toast);
    tree.update();
    assert.equal(tree.children().length, 0);

    cleanup();
  });

  it('should pause timer to remove toast when in focus', async () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    const closedSpy = sinon.spy();
    tree.instance().add(<Toast onClose={closedSpy}>Test</Toast>, 5);
    tree.update();
    assert.equal(tree.children().length, 1);

    tree.find(Toast).simulate('focus');
    await sleep(6);
    tree.update();
    assert.equal(tree.children().length, 1);
    assert(!closedSpy.calledOnce);

    cleanup();
  });

  it('should resume timer to remove toast when focus goes out', async () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    const closedSpy = sinon.spy();
    tree.instance().add(<Toast onClose={closedSpy}>Test</Toast>, 5);
    tree.update();
    assert.equal(tree.children().length, 1);
    await sleep(3);
    tree.find(Toast).simulate('focus');
    await sleep(6);
    tree.find(Toast).simulate('blur');
    await sleep(3);
    tree.update();
    assert.equal(tree.children().length, 0);
    assert(closedSpy.calledOnce);

    cleanup();
  });

  it('should never remove a toast with timeout 0', async () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    const closedSpy = sinon.spy();
    tree.instance().add(<Toast onClose={closedSpy}>Test</Toast>, 0);
    tree.update();
    assert.equal(tree.children().length, 1);
    await sleep(3);
    tree.update();
    assert.equal(tree.children().length, 1);
    assert(closedSpy.notCalled);

    cleanup();
  });

  it('should remove toasts when the remove button is clicked', () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    const closedSpy = sinon.spy();
    tree.instance().add(<Toast onClose={closedSpy}>Test</Toast>, 5);
    tree.update();
    assert.equal(tree.children().length, 1);

    const event = {data: 'test'};
    tree.find(Toast).simulate('close', event);
    tree.update();
    assert.equal(tree.children().length, 0);
    assert(closedSpy.calledOnce);
    assert(closedSpy.calledWith(event));
    cleanup();
  });

  it('should render a global toast container', async () => {
    const toast = <Toast>Test</Toast>;
    addToast(toast);

    const container = document.querySelector('.react-spectrum-ToastContainer');
    assert(container);
    assert.equal(container.childNodes.length, 1);
    assert(container.childNodes[0].classList.contains('spectrum-Toast'));

    removeToast(toast);
    await sleep(500); // wait for animation
    assert.equal(container.childNodes.length, 0);
  });

  it('should render a toast inside custom container', async() => {
    const customContainer = ReactDOM.render(<div />, document.createElement('div'));
    const toast = <Toast>Test</Toast>;
    const customContainerDOM = ReactDOM.findDOMNode(customContainer);
    addToast(toast, 0, customContainerDOM);
    const container = customContainer.childNodes[0].childNodes[0];
    assert(container.classList.contains('react-spectrum-ToastContainer'));
  });

  it('should render a success toast', async () => {
    success('Success');

    const container = document.querySelector('.react-spectrum-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--success');
    assert(toast);
    assert.equal(toast.textContent, 'Success');
  });

  it('should render a warning toast', () => {
    warning('Warning');

    const container = document.querySelector('.react-spectrum-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--warning');
    assert(toast);
    assert.equal(toast.textContent, 'Warning');
  });

  it('should render an error toast', () => {
    error('Error');

    const container = document.querySelector('.react-spectrum-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--error');
    assert(toast);
    assert.equal(toast.textContent, 'Error');
  });

  it('should render an info toast', () => {
    info('Info');

    const container = document.querySelector('.react-spectrum-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--info');
    assert(toast);
    assert.equal(toast.textContent, 'Info');
  });

  it('should render a help toast', () => {
    help('Help');

    const container = document.querySelector('.react-spectrum-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--help');
    assert(toast);
    assert.equal(toast.textContent, 'Help');
  });

  describe('should render Toasts according to placement props', () => {
    it('should render toast at top center', () => {
      setToastPlacement('top center');
      const tree = shallow(<ToastContainer />);
      const toast = <Toast>Test</Toast>;
      tree.instance().add(toast);
      tree.update();

      assert.equal(tree.children().length, 1);
      assert.equal(tree.prop('className'), 'react-spectrum-ToastContainer react-spectrum-ToastContainer--top react-spectrum-ToastContainer--center');
      cleanup();
    });

    it('should render toast at top left', () => {
      setToastPlacement('top left');
      const tree = shallow(<ToastContainer />);
      const toast = <Toast>Test</Toast>;
      tree.instance().add(toast);
      tree.update();

      assert.equal(tree.children().length, 1);
      assert.equal(tree.prop('className'), 'react-spectrum-ToastContainer react-spectrum-ToastContainer--top react-spectrum-ToastContainer--left');
      cleanup();
    });

    it('should render toast at top right', () => {
      setToastPlacement('top right');
      const tree = shallow(<ToastContainer />);
      const toast = <Toast>Test</Toast>;
      tree.instance().add(toast);
      tree.update();

      assert.equal(tree.children().length, 1);
      assert.equal(tree.prop('className'), 'react-spectrum-ToastContainer react-spectrum-ToastContainer--top react-spectrum-ToastContainer--right');
      cleanup();
    });

    it('should render toast at bottom', () => {
      setToastPlacement('bottom');
      const tree = shallow(<ToastContainer />);
      const toast = <Toast>Test</Toast>;
      tree.instance().add(toast);
      tree.update();

      assert.equal(tree.children().length, 1);
      assert.equal(tree.prop('className'), 'react-spectrum-ToastContainer react-spectrum-ToastContainer--bottom');
      cleanup();
    });
  });
});
