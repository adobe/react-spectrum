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
import {mount, shallow} from 'enzyme';
import Popover from '../../src/Popover';
import React from 'react';
import sinon from 'sinon';

describe('Popover', () => {
  let clock;
  let consoleErrorStub;
  before(() => {
    clock = sinon.useFakeTimers();
  });
  after(() => {
    clock.runAll();
    clock.restore();
  });
  beforeEach(() => {
    consoleErrorStub = sinon.stub(console, 'error');
  });
  afterEach(() => {
    consoleErrorStub.restore();
  });
  it('supports different variants', () => {
    const tree = shallow(<Popover variant="error" />);
    assert.equal(tree.hasClass('spectrum-Dialog--error'), true);
    tree.setProps({variant: 'info'});
    assert.equal(consoleErrorStub.args[0][0], 'Warning: Failed prop type: Invalid prop `variant` of value `info` supplied to `Popover`, expected one of ["default","error"].\n    in Popover');
    assert.equal(tree.hasClass('spectrum-Dialog--info'), true);
  });

  it('supports onKeyDown event handler', () => {
    const onKeyDown = sinon.spy();
    const tree = shallow(<Popover onKeyDown={onKeyDown} />);
    tree.simulate('keydown', {key: 'Tab', shiftKey: false});
    assert(onKeyDown.called);
  });

  it('supports onFocus event handler', () => {
    const onFocus = sinon.spy();
    const tree = shallow(<Popover onFocus={onFocus} trapFocus={false} />);
    tree.simulate('focus');
    assert(onFocus.called);
  });

  it('support stopPropagation within onFocus method to prevent trapFocus from executing', () => {
    let onFocusStopPropagation = (e) => {
      e.isPropagationStopped = () => true;
    };
    let tree = mount(<Popover onFocus={onFocusStopPropagation} />);
    clock.runAll();
    tree.simulate('focus', {type: 'focus'});
    assert.equal(document.activeElement, tree.getDOMNode());
    tree.unmount();
  });

  it('supports trapFocus', () => {
    const preventDefault = sinon.spy();
    const stopPropagation = sinon.spy();
    let tree = mount(<Popover>
      <button>First</button>
      <button>Last</button>
    </Popover>);
    const event = {
      preventDefault,
      stopPropagation
    };
    assert.equal(tree.childAt(0).prop('tabIndex'), 1);
    assert.equal(tree.childAt(0).prop('role'), 'dialog');
    tree.simulate('focus', {...event, type: 'focus'});
    assert(preventDefault.calledOnce);
    assert(stopPropagation.calledOnce);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());
    event.key = 'Tab';
    event.shiftKey = true;
    tree.find('button').first().simulate('keydown', {...event, type: 'keydown'});
    assert(preventDefault.calledTwice);
    assert(stopPropagation.calledTwice);
    assert.equal(document.activeElement, tree.find('button').last().getDOMNode());
    event.shiftKey = false;
    tree.find('button').last().simulate('keydown', {...event, type: 'keydown'});
    assert(preventDefault.calledThrice);
    assert(stopPropagation.calledThrice);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());

    tree.setProps({
      isDialog: false
    });
    assert.equal(tree.childAt(0).prop('role'), 'presentation');

    // Should support setting role prop
    tree.setProps({
      role: 'dialog'
    });
    assert.equal(tree.childAt(0).prop('role'), 'dialog');

    tree.simulate('focus', {...event, type: 'focus'});
    assert.equal(preventDefault.callCount, 4);
    assert.equal(stopPropagation.callCount, 4);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());

    tree.setProps({
      onKeyDown: e => e.isPropagationStopped = () => true
    });
    event.shiftKey = true;
    tree.find('button').first().simulate('keydown', {...event, type: 'keydown'});
    assert.equal(preventDefault.callCount, 4);
    assert.equal(stopPropagation.callCount, 4);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());
    tree.unmount();
  });

  it('supports optional title', () => {
    const tree = shallow(<Popover />);
    assert(!tree.find('DialogHeader').length);
    tree.setProps({title: 'Foo'});
    assert(tree.find('DialogHeader').length);
    assert.equal(tree.find('DialogHeader').prop('title'), 'Foo');
    tree.setProps({variant: 'error'});
    assert.equal(tree.find('DialogHeader').prop('variant'), 'error');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Popover className="foo" />);
    assert.equal(tree.hasClass('spectrum-Popover'), true);
    assert.equal(tree.hasClass('react-spectrum-Popover'), true);
    assert.equal(tree.hasClass('spectrum-Popover--withTip'), true);
    assert.equal(tree.hasClass('spectrum-Popover--dialog'), true);
    assert.equal(tree.hasClass('spectrum-Dialog--default'), true);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Popover aria-label="foo" aria-modal="true" />);
    assert.equal(tree.prop('aria-label'), 'foo');
    assert.equal(tree.prop('aria-modal'), 'true');
    tree.setProps({'aria-modal': null});
    assert.equal(tree.prop('aria-modal'), null);
  });
});
