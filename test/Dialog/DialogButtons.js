import assert from 'assert';
import Button from '../../src/Button';
import DialogButtons from '../../src/Dialog/js/DialogButtons';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('DialogButtons', () => {
  it('default', () => {
    const tree = shallow(<DialogButtons />);
    assert(tree.hasClass('react-spectrum-Dialog-buttons'));
  });

  it('renders no buttons on default', () => {
    const tree = shallow(<DialogButtons />);
    assert.equal(tree.find(Button).length, 0);
  });

  it('renders an OK button using confirmLabel', () => {
    const tree = shallow(<DialogButtons confirmLabel="OK" />);
    let button = tree.find(Button);
    assert.equal(button.length, 1);
    assert.equal(button.prop('variant'), 'primary');
    assert.equal(button.prop('label'), 'OK');
  });

  it('renders an OK and close button', () => {
    const tree = shallow(<DialogButtons confirmLabel="OK" cancelLabel="Close" />);
    let buttons = tree.find(Button);
    assert.equal(buttons.length, 2);
    assert.equal(buttons.at(0).prop('label'), 'Close');
    assert.equal(buttons.at(1).prop('label'), 'OK');
    assert.equal(buttons.at(0).prop('variant'), 'secondary');
    assert.equal(buttons.at(1).prop('variant'), 'primary');
  });

  it('renders three buttons with secondaryLabel', () => {
    const tree = shallow(<DialogButtons confirmLabel="Keep Both" secondaryLabel="Replace" cancelLabel="Cancel" />);
    let buttons = tree.find(Button);
    assert.equal(buttons.length, 3);
    assert.equal(buttons.at(0).prop('label'), 'Cancel');
    assert.equal(buttons.at(1).prop('label'), 'Replace');
    assert.equal(buttons.at(2).prop('label'), 'Keep Both');
    assert.equal(buttons.at(0).prop('variant'), 'secondary');
    assert.equal(buttons.at(1).prop('variant'), 'secondary');
    assert.equal(buttons.at(2).prop('variant'), 'primary');
  });

  it('supports onCancel and onConfirm', () => {
    const spy = sinon.spy();
    const tree = shallow(<DialogButtons confirmLabel="OK" cancelLabel="Close" onCancel={spy} onConfirm={spy} />);
    let buttons = tree.find(Button);
    buttons.at(0).simulate('click');
    assert(spy.calledOnce);
    buttons.at(1).simulate('click');
    assert(spy.calledTwice);
  });

  it('supports onConfirm with primary or secondary option', () => {
    const spy = sinon.spy();
    const tree = shallow(<DialogButtons confirmLabel="Keep Both" secondaryLabel="Replace" cancelLabel="Cancel" onConfirm={spy} />);
    let buttons = tree.find(Button);
    buttons.at(1).simulate('click');
    assert(spy.calledOnce);
    assert.equal(spy.getCall(0).args[0], 'secondary');
    buttons.at(2).simulate('click');
    assert(spy.calledTwice);
    assert.equal(spy.getCall(1).args[0], 'primary');
  });

  it('supports autoFocus=\'confirm\'', async () => {
    const tree = mount(<DialogButtons confirmLabel="OK" cancelLabel="Close" autoFocusButton="confirm" />);
    const dialogButtons = tree.find('DialogButtons');
    assert.equal(dialogButtons.prop('autoFocusButton'), 'confirm');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(1).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(1).getDOMNode());
    tree.unmount();
  });

  it('supports autoFocus=\'cancel\'', async () => {
    const tree = mount(<DialogButtons confirmLabel="OK" cancelLabel="Close" autoFocusButton="cancel" />);
    const dialogButtons = tree.find('DialogButtons');
    assert.equal(dialogButtons.prop('autoFocusButton'), 'cancel');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(0).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(0).getDOMNode());
    tree.unmount();
  });

  it('supports autoFocus=\'secondary\'', async () => {
    const tree = mount(<DialogButtons confirmLabel="OK" cancelLabel="Close" autoFocusButton="secondary" secondaryLabel="Replace" />);
    const dialogButtons = tree.find('DialogButtons');
    assert.equal(dialogButtons.prop('autoFocusButton'), 'secondary');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(0).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(1).getDOMNode());
    tree.unmount();
  });

  it('supports disabling confirm button', () => {
    const tree = shallow(<DialogButtons confirmLabel="OK" confirmDisabled />);
    assert(tree.find(Button).prop('disabled'));
    tree.setProps({confirmDisabled: false});
    assert(!tree.find(Button).prop('disabled'));
  });

  it('disables secondary button when confirm is disabled', () => {
    const tree = shallow(<DialogButtons confirmLabel="OK" secondaryLabel="Secondary" confirmDisabled />);
    assert(tree.find(Button).at(0).prop('disabled'));
    assert(tree.find(Button).at(1).prop('disabled'));
    tree.setProps({confirmDisabled: false});
    assert(!tree.find(Button).at(0).prop('disabled'));
    assert(!tree.find(Button).at(1).prop('disabled'));
  });
});
