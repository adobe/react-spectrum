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

import assert from 'assert';
import Dialog from '../../src/Dialog';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('Dialog', () => {
  it('default', () => {
    const tree = shallow(<Dialog />);
    assert(tree.hasClass('spectrum-Dialog'));
    assert.equal(tree.prop('id'), tree.instance().dialogId);
    tree.setProps({id: 'foo'});
    assert.equal(tree.prop('id'), 'foo');
    assert.equal(tree.prop('tabIndex'), 1);
  });

  it('supports optional title', () => {
    const tree = shallow(<Dialog />);
    assert.equal(tree.find(DialogHeader).length, 0);
    assert.equal(tree.prop('aria-labelledby'), null, 'with no title, aria-labelledby === null');
    tree.setProps({title: 'Foo'});
    assert.equal(tree.find(DialogHeader).length, 1);
    assert.equal(tree.find(DialogHeader).prop('id'), `${tree.prop('id')}-heading`, 'with title, DialogHeader has an id');
    assert.equal(tree.find(DialogHeader).dive().find('Heading').prop('id'), `${tree.prop('id')}-heading`, 'DialogHeader id propagates to Heading');
    assert.equal(tree.prop('aria-labelledby'), `${tree.prop('id')}-heading`, 'with title, aria-labelledby is set to id on DialogHeader > Heading');
  });

  it('supports optional footer', () => {
    const tree = shallow(<Dialog />);
    assert.equal(tree.find('.spectrum-Dialog-footer').length, 0);
    tree.setProps({confirmLabel: 'Go'});
    assert.equal(tree.find('.spectrum-Dialog-footer').length, 1);
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'information');
  });

  it('defaults to information variant with only confirm button', () => {
    const tree = shallow(<Dialog confirmLabel="OK" />);
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'information');
  });

  it('defaults to information variant with confirm and cancel button', () => {
    const tree = shallow(<Dialog confirmLabel="OK" cancelLabel="Cancel" />);
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'confirmation');
  });

  it('supports different variants', () => {
    const tree = shallow(<Dialog variant="error" confirmLabel="OK" />);
    assert(tree.hasClass('spectrum-Dialog--error'));
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'error');

    tree.setProps({variant: 'information'});
    assert(!tree.hasClass('spectrum-Dialog--error'));
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'information');

    tree.setProps({variant: 'confirmation'});
    assert(!tree.hasClass('spectrum-Dialog--error'));
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'confirmation');

    tree.setProps({variant: 'destructive'});
    assert(!tree.hasClass('spectrum-Dialog--error'));
    assert(tree.find('.spectrum-Dialog-footer').prop('variant'), 'destructive');
  });

  it('supports alert mode', () => {
    const tree = shallow(<Dialog mode="alert" confirmLabel="Go" />);
    assert(tree.hasClass('spectrum-Dialog--alert'));
  });

  it('supports fullscreen mode', () => {
    const tree = shallow(<Dialog mode="fullscreen" confirmLabel="Go" />);
    assert(tree.hasClass('spectrum-Dialog--fullscreen'));
    assert.equal(tree.find('.spectrum-Dialog-footer').length, 0);
  });

  it('supports fullscreen takeover mode', () => {
    const tree = shallow(<Dialog mode="fullscreenTakeover" confirmLabel="Go" />);
    assert(tree.hasClass('spectrum-Dialog--fullscreenTakeover'));
    assert.equal(tree.find('.spectrum-Dialog-footer').length, 0);
  });

  it('supports dismissible dialog', () => {
    const tree = shallow(<Dialog isDismissible confirmLabel="Go" />);
    assert(tree.hasClass('spectrum-Dialog--dismissible'));
    assert.equal(tree.find('.spectrum-Dialog-footer').length, 0);
  });

  it('renders content comp if there is a title', () => {
    const tree = shallow(<Dialog title="test"><span>bar</span></Dialog>);
    let content = tree.find('.spectrum-Dialog-content');
    assert.equal(content.length, 1);
    assert.equal(content.childAt(0).type(), 'span');
  });

  it('does not render a content comp if there is no title', () => {
    const tree = shallow(<Dialog><span>bar</span></Dialog>);
    let content = tree.find('.spectrum-Dialog-content');
    assert.equal(content.length, 0);
  });

  it('calls props.onClose', () => {
    var onClose = sinon.spy();
    const tree = shallow(<Dialog confirmLabel="Close" onClose={onClose} />);
    tree.find('.spectrum-Dialog-footer').simulate('close');
    assert(onClose.calledOnce);
  });

  it('calls props.onConfirm and onClose', async () => {
    var stub = sinon.stub();
    stub.returns(true);

    var onClose = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onConfirm={stub} confirmLabel="Go" />);
    tree.find('.spectrum-Dialog-footer').simulate('confirm');
    assert(stub.calledOnce);
    await sleep(1);
    assert(onClose.calledOnce);
  });

  it('calls props.onCancel and onClose', async () => {
    var stub = sinon.stub();
    stub.returns(true);

    var onClose = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onCancel={stub} confirmLabel="Go" />);
    tree.find('.spectrum-Dialog-footer').simulate('cancel');
    assert(stub.calledOnce);
    await sleep(1);
    assert(onClose.calledOnce);
  });

  it('calls props.onConfirm but not onClose', async () => {
    var stub = sinon.stub();
    stub.returns(false);

    var onClose = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onConfirm={stub} confirmLabel="Go" />);
    tree.find('.spectrum-Dialog-footer').simulate('confirm');
    assert(stub.calledOnce);
    await sleep(1);
    assert(!onClose.calledOnce);
  });

  it('calls props.onCancel but not onClose', async () => {
    var stub = sinon.stub();
    stub.returns(false);

    var onClose = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onCancel={stub} confirmLabel="Go" />);
    tree.find('.spectrum-Dialog-footer').simulate('cancel');
    assert(stub.calledOnce);
    await sleep(1);
    assert(!onClose.calledOnce);
  });

  it('supports autoFocusButton=\'confirm\'', async () => {
    let tree = mount(<Dialog cancelLabel="Cancel" confirmLabel="Go" autoFocusButton="confirm" />);
    let dialogButtons = tree.find('DialogButtons');
    assert.equal(dialogButtons.prop('autoFocusButton'), 'confirm');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(1).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(1).getDOMNode());
    tree.unmount();
  });

  it('supports autoFocusButton=\'cancel\'', async () => {
    let tree = mount(<Dialog cancelLabel="Cancel" confirmLabel="Go" autoFocusButton="cancel" />);
    let dialogButtons = tree.find('DialogButtons');
    assert.equal(dialogButtons.prop('autoFocusButton'), 'cancel');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(0).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(0).getDOMNode());
    tree.unmount();
  });

  it('focusing Dialog itself should simply focus the dialog', async () => {
    let onFocusSpy = sinon.spy();
    let tree = mount(<Dialog cancelLabel="Cancel" confirmLabel="OK" onFocus={onFocusSpy} />);
    // onFocus, Dialog will marshall focus to first tabbable descendant.
    tree.getDOMNode().focus();
    tree.simulate('focus', {type: 'focus'});
    await sleep(17);
    assert(onFocusSpy.called);
    assert.equal(document.activeElement, tree.getDOMNode());

    let dialogButtons = tree.find('DialogButtons');
    let buttons = dialogButtons.find('Button');
    let preventDefault = sinon.spy();
    let stopPropagation = sinon.spy();
    tree.simulate('keydown', {type: 'keydown', key: 'Tab', preventDefault, stopPropagation});
    assert(preventDefault.called);
    assert(stopPropagation.called);
    assert.equal(document.activeElement, buttons.first().getDOMNode());

    onFocusSpy.resetHistory();
    preventDefault.resetHistory();
    stopPropagation.resetHistory();

    tree.getDOMNode().focus();
    tree.simulate('keydown', {type: 'keydown', key: 'Tab', shiftKey: true, preventDefault, stopPropagation});
    assert(preventDefault.called);
    assert(stopPropagation.called);
    assert.equal(document.activeElement, buttons.last().getDOMNode());
    tree.unmount();
  });

  it('trapFocus: false should prevent trapFocus from executing', async () => {
    let tree = mount(<Dialog confirmLabel="OK" trapFocus={false} />);
    tree.getDOMNode().focus();
    tree.simulate('focus', {type: 'focus'});
    await sleep(17);
    assert.equal(document.activeElement, tree.getDOMNode());
    tree.unmount();
  });

  it('focus Dialog itself if it contains no tabbable children', async () => {
    let tree = mount(<Dialog />);
    tree.getDOMNode().focus();
    await sleep(17);
    assert.equal(document.activeElement, tree.getDOMNode());
    tree.unmount();
  });

  it('supports disabling confirm button', () => {
    const tree = shallow(<Dialog confirmLabel="OK" confirmDisabled />);
    let dialogButtons = tree.find('DialogButtons');
    assert(dialogButtons.prop('confirmDisabled'));
    assert(dialogButtons.dive().find('Button').prop('disabled'));
    tree.setProps({confirmDisabled: false});
    dialogButtons = tree.find('DialogButtons');
    assert(!dialogButtons.prop('confirmDisabled'));
    assert(!dialogButtons.dive().find('Button').prop('disabled'));
  });

  it('supports keyboardConfirm', async () => {
    var stub = sinon.stub();
    stub.returns(true);

    var onClose = sinon.spy();
    var onKeyDown = sinon.spy();
    const tree = shallow(<Dialog keyboardConfirm confirmDisabled onClose={onClose} onConfirm={stub} onKeyDown={onKeyDown} confirmLabel="Go" />);
    tree.simulate('keydown', {key: 'Enter'});
    assert(onKeyDown.calledOnce);
    assert(!stub.calledOnce);
    await sleep(1);
    assert(!onClose.calledOnce);

    onKeyDown.resetHistory();

    tree.setProps({'confirmDisabled': false});
    tree.simulate('keydown', {key: 'Enter'});
    assert(onKeyDown.calledOnce);
    assert(stub.calledOnce);
    await sleep(1);
    assert(onClose.calledOnce);

    stub.resetHistory();
    onClose.resetHistory();
    onKeyDown.resetHistory();

    // stopPropagation
    tree.simulate('keydown', {key: 'Enter', isPropagationStopped: () => true});
    assert(onKeyDown.calledOnce);
    assert(!stub.calledOnce);
    await sleep(17);
    assert(!onClose.calledOnce);

    onKeyDown.resetHistory();

    tree.setProps({'confirmDisabled': false});
    tree.simulate('keydown', {key: 'ArrowDown'});
    assert(onKeyDown.calledOnce);
    assert(!stub.calledOnce);
    await sleep(1);
    assert(!onClose.calledOnce);

    onKeyDown.resetHistory();

    tree.setProps({'confirmDisabled': false, 'keyboardConfirm': false});
    tree.simulate('keydown', {key: 'Enter'});
    assert(onKeyDown.calledOnce);
    assert(!stub.calledOnce);
    await sleep(1);
    assert(!onClose.calledOnce);
  });

  it('Esc key triggers onCancel', async () => {
    var stub = sinon.stub();
    stub.returns(true);

    var onClose = sinon.spy();
    var onKeyDown = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onCancel={stub} onKeyDown={onKeyDown} cancelLabel="Cancel" />);
    tree.simulate('keydown', {key: 'Esc'});
    assert(onKeyDown.calledOnce);
    assert(stub.calledOnce);
    await sleep(1);
    assert(onClose.calledOnce);
    tree.simulate('keydown', {key: 'Escape'});

    assert(onKeyDown.calledTwice);
    assert(stub.calledTwice);
    await sleep(1);
    assert(onClose.calledTwice);
  });

  describe('Accessibility', () => {
    it('supports aria-label property', () => {
      const tree = shallow(<Dialog aria-label="foo" />);
      assert.equal(tree.prop('aria-label'), 'foo');
    });

    it('supports aria-labelledby property', () => {
      const tree = shallow(<Dialog aria-labelledby="foo" />);
      assert.equal(tree.prop('aria-labelledby'), 'foo');
      tree.setProps({'aria-labelledby': null, title: 'test'});
      const dialogId = tree.instance().dialogId;
      assert.equal(tree.prop('id'), dialogId);
      assert.equal(tree.prop('aria-labelledby'), `${dialogId}-heading`);
    });

    it('supports aria-describedby property', () => {
      const tree = shallow(<Dialog aria-describedby="foo" />);
      assert.equal(tree.prop('aria-describedby'), 'foo');
      tree.setProps({'aria-describedby': null, title: 'test'});
      const dialogId = tree.instance().dialogId;
      assert.equal(tree.prop('aria-describedby'), null);
      tree.setProps({children: <span>bar</span>});
      assert.equal(tree.prop('aria-describedby'), `${dialogId}-content`);
      tree.setProps({title: null});
      assert.equal(tree.prop('aria-describedby'), null);
    });

    it('supports aria-modal property', () => {
      const tree = shallow(<Dialog />);
      assert.equal(tree.prop('aria-modal'), Dialog.defaultProps.trapFocus);
      tree.setProps({trapFocus: false});
      assert.equal(tree.prop('aria-modal'), false);
      tree.setProps({'aria-modal': true});
      assert.equal(tree.prop('aria-modal'), true);
    });
  });
});
