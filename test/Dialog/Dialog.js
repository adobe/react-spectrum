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
    assert(tree.hasClass('spectrum-Dialog--default'));
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
  });

  it('supports different variants', () => {
    const tree = shallow(<Dialog variant="error" />);
    assert(tree.hasClass('spectrum-Dialog--error'));
    tree.setProps({variant: 'info'});
    assert(tree.hasClass('spectrum-Dialog--info'));
    tree.setProps({variant: 'help'});
    assert(tree.hasClass('spectrum-Dialog--help'));
    tree.setProps({variant: 'success'});
    assert(tree.hasClass('spectrum-Dialog--success'));
    tree.setProps({variant: 'warning'});
    assert(tree.hasClass('spectrum-Dialog--warning'));
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

  it('renders content comp', () => {
    const tree = shallow(<Dialog><span>bar</span></Dialog>);
    let content = tree.find('.spectrum-Dialog-content');
    assert.equal(content.length, 1);
    assert.equal(content.prop('children')[0].type, 'span');
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
});
