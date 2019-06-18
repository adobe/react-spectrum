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
import {sleep} from '../utils';

describe('Popover', () => {
  it('supports different variants', () => {
    const tree = shallow(<Popover variant="info" />);
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

  it('support stopPropagation within onFocus method to prevent trapFocus from executing', async () => {
    let onFocusStopPropagation = (e) => {
      e.isPropagationStopped = () => true;
    };
    let tree = mount(<Popover onFocus={onFocusStopPropagation} />);
    await sleep(17);
    tree.simulate('focus', {type: 'focus'});
    assert.equal(document.activeElement, tree.getDOMNode());
    tree.unmount();
  });

  it('supports trapFocus', () => {
    const preventDefault = sinon.spy();
    const stopPropagation = sinon.spy();
    const tree = mount(<Popover>
      <button>First</button>
      <button>Last</button>
    </Popover>);
    const event = {
      preventDefault,
      stopPropagation
    };
    assert.equal(tree.childAt(0).prop('tabIndex'), 1);
    assert.equal(tree.childAt(0).prop('role'), 'presentation');
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

    // Should support setting role prop
    tree.setProps({
      role: 'dialog'
    });
    assert.equal(tree.childAt(0).prop('role'), 'dialog');

    // Should support stopPropagation from within onKeyDown event listener
    tree.setProps({
      'onKeyDown': e => e.isPropagationStopped = () => true
    });
    event.shiftKey = true;
    tree.find('button').first().simulate('keydown', {...event, type: 'keydown'});
    assert(preventDefault.calledThrice);
    assert(stopPropagation.calledThrice);
    assert.equal(document.activeElement, tree.find('button').first().getDOMNode());
    tree.unmount();
  });

  // it('supports different variants', () => {
  //   const tree = shallow(<Popover variant="info" />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.hasClass('spectrum-Dialog--info'), true);
  // });

  // it('supports optional title', () => {
  //   const tree = shallow(<Popover />);
  //   let header = shallow(tree.prop('content')).find(DialogHeader);
  //   assert(!header.node);
  //   tree.setProps({title: 'Foo'});
  //   header = shallow(tree.prop('content')).find(DialogHeader);
  //   assert(header.node);
  //   assert.equal(header.prop('title'), 'Foo');
  // });

  // it('supports additional classNames', () => {
  //   const tree = shallow(<Popover className="foo" />);
  //   assert.equal(tree.hasClass('foo'), true);
  // });

  // it('supports additional properties', () => {
  //   const tree = shallow(<Popover foo />);
  //   const contentTree = shallow(tree.prop('content'));
  //   assert.equal(contentTree.prop('foo'), true);
  // });
});
