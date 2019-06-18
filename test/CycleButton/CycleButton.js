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
import CycleButton from '../../src/CycleButton';
import PauseCircle from '../../src/Icon/PauseCircle';
import PlayCircle from '../../src/Icon/PlayCircle';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('CycleButton', () => {
  it('renders a <button> tag with correct props', () => {
    let tree = shallow(<CycleButton actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]} />);
    assert.equal(tree.prop('className'), 'spectrum-CycleButton');
    assert.equal(tree.prop('quiet'), true);
    assert.equal(tree.prop('variant'), 'action');
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Play');
    assert.equal(tree.children().last().dive().prop('aria-hidden'), true);
    assert.equal(tree.children().last().prop('size'), 'S');
  });

  it('renders with defaultAction', () => {
    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      defaultAction="pause" />);
    assert.equal(tree.prop('className'), 'spectrum-CycleButton');
    assert.equal(tree.prop('quiet'), true);
    assert.equal(tree.prop('variant'), 'action');
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Pause');
  });

  it('renders with controlled component', () => {
    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      action="pause" />);
    let instance = tree.instance();
    let preventDefaultSpy = sinon.spy();
    instance.buttonRef = {
      click: () => instance.onClick({preventDefault: preventDefaultSpy})
    };
    assert.equal(tree.prop('className'), 'spectrum-CycleButton');
    assert.equal(tree.prop('quiet'), true);
    assert.equal(tree.prop('variant'), 'action');
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Pause');
  });

  it('calls onAction with next action when clicked', () => {
    let onAction = sinon.spy();
    let onChange = sinon.spy();

    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      onChange={onChange}
      onAction={onAction} />);
    tree.find('Button').simulate('click');
    sinon.assert.calledOnce(onAction);
    sinon.assert.calledWith(onAction, 'play');
    sinon.assert.calledWith(onChange, 'pause');
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Pause');
    tree.find('Button').simulate('click');
    sinon.assert.calledTwice(onAction);
    sinon.assert.calledWith(onAction, 'pause');
    sinon.assert.calledWith(onChange, 'play');
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Play');
  });

  it('supports controlled action prop', () => {
    let tree = shallow(<CycleButton actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]} />);
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Play');
    tree.setProps({action: 'pause'});
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Pause');
  });

  it('calls onChange with current action when controlled', () => {
    let onChange = sinon.spy();
    let onAction = sinon.spy();

    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      onChange={onChange}
      onAction={onAction}
      action="play" />);
    tree.find('Button').simulate('click');
    sinon.assert.calledWith(onChange, 'pause');
    sinon.assert.calledWith(onAction, 'play');
    assert.equal(tree.state('action'), 'play');
  });

  it('renders with disabled', () => {
    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      disabled />);
    assert.equal(tree.prop('className'), 'spectrum-CycleButton');
    assert.equal(tree.prop('quiet'), true);
    assert.equal(tree.prop('variant'), 'action');
    assert.equal(tree.find('.u-react-spectrum-screenReaderOnly').text(), 'Play');
    assert.equal(tree.children().last().dive().prop('aria-hidden'), true);
  });

  it('throws error with invalid defaultAction', () => {
    try {
      shallow(<CycleButton
        actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
        defaultAction="invalidAction" />);
    } catch (e) {
      assert.equal(e, 'Invalid Props');
    }
  });

  it('throws error with invalid controlled component action', () => {
    try {
      shallow(<CycleButton
        actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
        action="invalidAction" />);
    } catch (e) {
      assert.equal(e, 'Invalid Props');
    }
  });
});
