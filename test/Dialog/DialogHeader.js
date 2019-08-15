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
    assert(tree.find(DialogButtons).dive().find('Button').prop('disabled'));
    tree.setProps({confirmDisabled: false});
    assert(!tree.find(DialogButtons).prop('confirmDisabled'));
    assert(!tree.find(DialogButtons).dive().find('Button').prop('disabled'));
  });
});
