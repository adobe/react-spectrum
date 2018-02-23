import assert from 'assert';
import Button from '../../src/Button';
import DialogButtons from '../../src/Dialog/js/DialogButtons';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('DialogButtons', () => {
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

  it('Supports the onCancel and onConfirm', () => {
    const spy = sinon.spy();
    const tree = shallow(<DialogButtons confirmLabel="OK" cancelLabel="Close" onCancel={spy} onConfirm={spy} />);
    let buttons = tree.find(Button);
    buttons.at(0).simulate('click');
    assert(spy.calledOnce);
    buttons.at(1).simulate('click');
    assert(spy.calledTwice);
  });
});
