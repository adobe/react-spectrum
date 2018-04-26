import assert from 'assert';
import DialogButtons from '../../src/Dialog/js/DialogButtons';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {sleep} from '../utils';

describe('DialogHeader', () => {
  it('supports optional title', () => {
    const tree = shallow(<DialogHeader />);
    tree.setProps({title: 'title'});
    assert.equal(tree.find(DialogButtons).length, 0);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<DialogHeader className="myClass" />);
    assert(tree.hasClass('myClass'));
  });

  it('supports fullscreen mode', () => {
    const tree = shallow(<DialogHeader fullscreen confirmLabel="Go" />);
    assert.equal(tree.find(DialogButtons).length, 1);
  });

  it('supports fullscreen takeover mode', () => {
    const tree = shallow(<DialogHeader fullscreen confirmLabel="Go" />);
    assert.equal(tree.find(DialogButtons).length, 1);
  });

  it('supports autoFocus=\'confirm\'', async () => {
    const tree = mount(<DialogHeader fullscreen confirmLabel="OK" cancelLabel="Close" autoFocusButton="confirm" />);
    const dialogButtons = tree.find(DialogButtons);
    assert.equal(dialogButtons.prop('autoFocusButton'), 'confirm');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(1).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(1).getDOMNode());
    tree.unmount();
  });

  it('supports autoFocus=\'cancel\'', async () => {
    const tree = mount(<DialogHeader fullscreen confirmLabel="OK" cancelLabel="Close" autoFocusButton="cancel" />);
    const dialogButtons = tree.find(DialogButtons);
    assert.equal(dialogButtons.prop('autoFocusButton'), 'cancel');
    let buttons = dialogButtons.find('Button');
    await sleep(17);
    assert(!buttons.at(0).getDOMNode().getAttribute('autoFocus'));
    assert.equal(document.activeElement, buttons.at(0).getDOMNode());
    tree.unmount();
  });

  it('supports disabling confirm button', () => {
    const tree = shallow(<DialogHeader fullscreen confirmLabel="OK" confirmDisabled />);
    assert(tree.find(DialogButtons).prop('confirmDisabled'));
    assert(tree.find(DialogButtons).shallow().find('Button').prop('disabled'));
    tree.setProps({confirmDisabled: false});
    assert(!tree.find(DialogButtons).prop('confirmDisabled'));
    assert(!tree.find(DialogButtons).shallow().find('Button').prop('disabled'));
  });
});
