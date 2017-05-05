import assert from 'assert';
import Dialog from '../../src/Dialog';
import DialogContent from '../../src/Dialog/js/DialogContent';
import DialogFooter from '../../src/Dialog/js/DialogFooter';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {sleep} from '../utils';


describe('Dialog', () => {
  it('default', () => {
    const tree = shallow(<Dialog />);
    assert(tree.hasClass('coral-Dialog--default'));
    assert(tree.hasClass('coral-Dialog--M'), );
  });

  it('supports optional title', () => {
    const tree = shallow(<Dialog />);
    assert.equal(tree.find(DialogHeader).length, 0);
    tree.setProps({title: 'Foo'});
    assert.equal(tree.find(DialogHeader).length, 1);
  });

  it('supports optional footer', () => {
    const tree = shallow(<Dialog />);
    assert.equal(tree.find(DialogFooter).length, 0);
    tree.setProps({confirmLabel: 'Go'});
    assert.equal(tree.find(DialogFooter).length, 1);
  });

  it('supports different sizes', () => {
    const tree = shallow(<Dialog size="S" />);
    assert(tree.hasClass('coral-Dialog--S'));
    tree.setProps({size: 'L'});
    assert(tree.hasClass('coral-Dialog--L'));
  });

  it('supports different variants', () => {
    const tree = shallow(<Dialog variant="error" />);
    assert(tree.hasClass('coral-Dialog--error'));
    tree.setProps({variant: 'info'});
    assert(tree.hasClass('coral-Dialog--info'));
    tree.setProps({variant: 'help'});
    assert(tree.hasClass('coral-Dialog--help'));
    tree.setProps({variant: 'success'});
    assert(tree.hasClass('coral-Dialog--success'));
    tree.setProps({variant: 'warning'});
    assert(tree.hasClass('coral-Dialog--warning'));
  });

  it('renders content comp', () => {
    const tree = shallow(<Dialog><span>bar</span></Dialog>);
    let content = tree.find(DialogContent);
    assert.equal(content.length, 1);
    assert.equal(content.prop('children')[0].type, 'span');
  });

  it('calls props.onClose', () => {
    var onClose = sinon.spy();
    const tree = shallow(<Dialog confirmLabel="Close" onClose={onClose} />);
    tree.find(DialogFooter).simulate('close');
    assert(onClose.calledOnce);
  });

  it('calls props.onConfirm and onClose', async () => {
    var stub = sinon.stub();
    stub.returns(true);

    var onClose = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onConfirm={stub} confirmLabel="Go" />);
    tree.find(DialogFooter).simulate('confirm');
    assert(stub.calledOnce);    
    await sleep(1);
    assert(onClose.calledOnce);
  });

  it('calls props.onConfirm but not onClose', async () => {
    var stub = sinon.stub();
    stub.returns(false);

    var onClose = sinon.spy();
    const tree = shallow(<Dialog onClose={onClose} onConfirm={stub} confirmLabel="Go" />);
    tree.find(DialogFooter).simulate('confirm');
    assert(stub.calledOnce);    
    await sleep(1);
    assert(!onClose.calledOnce);
  });
});
