import {addToast, error, help, info, removeToast, success, Toast, ToastContainer, warning} from '../../src/Toast';
import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import {sleep} from '../utils';

describe('ToastContainer', () => {
  it('should render toasts', () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.prop('className'), 'coral-ToastContainer');
    assert.equal(tree.children().length, 0);

    const toast = <Toast>Test</Toast>;
    tree.instance().add(toast);
    assert.equal(tree.children().length, 1);

    tree.instance().remove(toast);
    assert.equal(tree.children().length, 0);
  });

  it('should remove toasts after a timeout', async () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    tree.instance().add(<Toast>Test</Toast>, 5);
    assert.equal(tree.children().length, 1);

    await sleep(6);
    assert.equal(tree.children().length, 0);
  });

  it('should remove toasts when the remove button is clicked', () => {
    const tree = shallow(<ToastContainer />);
    assert.equal(tree.children().length, 0);

    tree.instance().add(<Toast>Test</Toast>, 5);
    assert.equal(tree.children().length, 1);

    tree.find(Toast).simulate('close');
    assert.equal(tree.children().length, 0);
  });

  it('should render a global toast container', async () => {
    const toast = <Toast>Test</Toast>;
    addToast(toast);

    const container = document.querySelector('.coral-ToastContainer');
    assert(container);
    assert.equal(container.childNodes.length, 1);
    assert(container.childNodes[0].classList.contains('spectrum-Toast'));

    removeToast(toast);
    await sleep(500); // wait for animation
    assert.equal(container.childNodes.length, 0);
  });

  it('should render a success toast', () => {
    success('Success');

    const container = document.querySelector('.coral-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--success');
    assert(toast);
    assert.equal(toast.textContent, 'Success');
  });

  it('should render a warning toast', () => {
    warning('Warning');

    const container = document.querySelector('.coral-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--warning');
    assert(toast);
    assert.equal(toast.textContent, 'Warning');
  });

  it('should render an error toast', () => {
    error('Error');

    const container = document.querySelector('.coral-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--error');
    assert(toast);
    assert.equal(toast.textContent, 'Error');
  });

  it('should render an info toast', () => {
    info('Info');

    const container = document.querySelector('.coral-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--info');
    assert(toast);
    assert.equal(toast.textContent, 'Info');
  });

  it('should render a help toast', () => {
    help('Help');

    const container = document.querySelector('.coral-ToastContainer');
    const toast = container.querySelector('.spectrum-Toast.spectrum-Toast--help');
    assert(toast);
    assert.equal(toast.textContent, 'Help');
  });
});
