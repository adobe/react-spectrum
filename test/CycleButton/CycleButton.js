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
    assert.equal(tree.children().prop('aria-label'), 'Play');
    assert.equal(tree.children().prop('size'), 'S');
  });

  it('renders with defaultAction', () => {
    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      defaultAction="pause" />);
    assert.equal(tree.prop('className'), 'spectrum-CycleButton');
    assert.equal(tree.prop('quiet'), true);
    assert.equal(tree.prop('variant'), 'action');
    assert.equal(tree.children().prop('aria-label'), 'Pause');
  });

  it('renders with controlled component', () => {
    let tree = shallow(<CycleButton
      actions={[{name: 'play', icon: <PlayCircle />, label: 'Play'}, {name: 'pause', icon: <PauseCircle />, label: 'Pause'}]}
      action="pause" />);
    let instance = tree.instance();
    instance.buttonRef = {
      click: () => instance.onClick({preventDefault: preventDefaultSpy})
    };
    assert.equal(tree.prop('className'), 'spectrum-CycleButton');
    assert.equal(tree.prop('quiet'), true);
    assert.equal(tree.prop('variant'), 'action');
    assert.equal(tree.children().prop('aria-label'), 'Pause');
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
    assert.equal(tree.children().prop('aria-label'), 'Play');
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
