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
import Position from '../../src/OverlayTrigger/js/Position';
import React from 'react';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

describe('Position', () => {
  const container = document.createElement('div');
  class Target extends React.Component {
    render() {
      return <div />;
    }
  }

  const target = ReactDOM.render(<Target />, container);
  let tree;
  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });

  it('passes props to child', () => {
    tree = shallow(<Position target={target}><div>test</div></Position>, {disableLifecycleMethods: true});
    assert.equal(tree.type(), 'div');
    assert.deepEqual(tree.prop('style'), {
      position: 'absolute',
      zIndex: 100000,
      left: 0,
      top: 0,
      maxHeight: undefined
    });

    assert.deepEqual(tree.prop('arrowStyle'), {
      left: null,
      top: null
    });
  });

  it('updates position on mount', () => {
    const stub = sinon.stub(require('../../src/OverlayTrigger/js/calculatePosition'), 'default').returns({
      positionLeft: 100,
      positionTop: 50,
      maxHeight: 200,
      arrowOffsetLeft: '0%',
      arrowOffsetTop: '50%'
    });
    tree = mount(<Position flip={false} placement="bottom" target={target} containerPadding={15}><div>test</div></Position>);
    const div = tree.find('div');

    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(stub.callCount - 1).args, ['bottom', ReactDOM.findDOMNode(tree.instance()), ReactDOM.findDOMNode(target), document.body, 15, false, undefined, 0, 0]);

    assert.deepEqual(div.prop('style'), {
      position: 'absolute',
      zIndex: 100000,
      left: 100,
      top: 50,
      maxHeight: 200
    });

    assert.deepEqual(div.prop('arrowStyle'), {
      left: '0%',
      top: '50%'
    });

    stub.restore();
    stub.resetHistory();
  });

  it('updates position on prop change', () => {
    const stub = sinon.stub(require('../../src/OverlayTrigger/js/calculatePosition'), 'default').returns({
      positionLeft: 100,
      positionTop: 50,
      maxHeight: 200,
      arrowOffsetLeft: '0%',
      arrowOffsetTop: '50%'
    });
    tree = mount(<Position flip={false} placement="bottom" target={target}><div>test</div></Position>);

    stub.returns({
      positionLeft: 50,
      positionTop: 150,
      maxHeight: 100,
      arrowOffsetLeft: '50%',
      arrowOffsetTop: '0%'
    });

    tree.setProps({placement: 'left'});
    tree.update();
    const div = tree.find('div');

    assert(stub.calledTwice);
    assert.deepEqual(stub.getCall(stub.callCount - 1).args, ['left', ReactDOM.findDOMNode(tree.instance()), ReactDOM.findDOMNode(target), document.body, 10, false, undefined, 0, 0]);

    assert.deepEqual(div.prop('style'), {
      position: 'absolute',
      zIndex: 100000,
      left: 50,
      top: 150,
      maxHeight: 100
    });

    assert.deepEqual(div.prop('arrowStyle'), {
      left: '50%',
      top: '0%'
    });

    stub.restore();
    stub.resetHistory();
  });

  it('updates position on window resize', () => {
    const stub = sinon.stub(require('../../src/OverlayTrigger/js/calculatePosition'), 'default').returns({
      positionLeft: 100,
      positionTop: 50,
      maxHeight: 200,
      arrowOffsetLeft: '0%',
      arrowOffsetTop: '50%'
    });
    tree = mount(<Position flip={false} placement="bottom" target={target}><div>test</div></Position>);

    stub.returns({
      positionLeft: 50,
      positionTop: 150,
      maxHeight: 100,
      arrowOffsetLeft: '50%',
      arrowOffsetTop: '0%'
    });

    let event = document.createEvent('Event');
    event.initEvent('resize', false, false);
    window.dispatchEvent(event);
    tree.update(); // update after event dispatch

    const div = tree.find('div');
    assert(stub.calledTwice);
    assert.deepEqual(stub.getCall(stub.callCount - 1).args, ['bottom', ReactDOM.findDOMNode(tree.instance()), ReactDOM.findDOMNode(target), document.body, 10, false, undefined, 0, 0]);

    assert.deepEqual(div.prop('style'), {
      position: 'absolute',
      zIndex: 100000,
      left: 50,
      top: 150,
      maxHeight: 100
    });

    assert.deepEqual(div.prop('arrowStyle'), {
      left: '50%',
      top: '0%'
    });

    stub.restore();
    stub.resetHistory();
  });
});
