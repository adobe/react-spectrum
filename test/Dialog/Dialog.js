import assert from 'assert';
import Dialog from '../../src/Dialog';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('Dialog', () => {
  it('default', () => {
    const tree = shallow(<Dialog />);
    assert(tree.hasClass('spectrum-Dialog'));
    assert(tree.hasClass('spectrum-Dialog--centered'));
  });

  it('supports optional title', () => {
    const tree = shallow(<Dialog />);
    assert.equal(tree.find(DialogHeader).length, 0);
    tree.setProps({title: 'Foo'});
    assert.equal(tree.find(DialogHeader).length, 1);
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

});
