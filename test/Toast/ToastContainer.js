import {addToast, error, help, info, removeToast, success, Toast, ToastContainer, warning} from '../../src/Toast';
import assert from 'assert';
import React from 'react';
import ReactDOM from 'react-dom';
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
    assert.equal(tree.prop('className'), 'react-spectrum-ToastContainer');
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

  it('should remove toasts after a timeout', async () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    const closedSpy = sinon.spy();
    tree.instance().add(<Toast onClose={closedSpy}>Test</Toast>, 5);
    tree.update();
    assert.equal(tree.children().length, 1);

    await sleep(6);
    tree.update();
    assert.equal(tree.children().length, 0);
    assert(closedSpy.calledOnce);

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

});
