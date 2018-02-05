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

  it('passes props to child', () => {
    const tree = shallow(<Position target={target}><div>test</div></Position>, {disableLifecycleMethods: true});
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
    const tree = mount(<Position placement="bottom" target={target} containerPadding={15}><div>test</div></Position>);
    const div = tree.find('div');

    assert(stub.calledOnce);
    assert.deepEqual(stub.getCall(0).args, ['bottom', ReactDOM.findDOMNode(tree.instance()), ReactDOM.findDOMNode(target), document.body, 15, 0, 0]);

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
    tree.unmount();
  });

  it('updates position on prop change', () => {
    const stub = sinon.stub(require('../../src/OverlayTrigger/js/calculatePosition'), 'default').returns({
      positionLeft: 100,
      positionTop: 50,
      maxHeight: 200,
      arrowOffsetLeft: '0%',
      arrowOffsetTop: '50%'
    });
    const tree = mount(<Position placement="bottom" target={target}><div>test</div></Position>);

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
    assert.deepEqual(stub.getCall(1).args, ['left', ReactDOM.findDOMNode(tree.instance()), ReactDOM.findDOMNode(target), document.body, 10, 0, 0]);

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
    tree.unmount();
  });

  it('updates position on window resize', () => {
    const stub = sinon.stub(require('../../src/OverlayTrigger/js/calculatePosition'), 'default').returns({
      positionLeft: 100,
      positionTop: 50,
      maxHeight: 200,
      arrowOffsetLeft: '0%',
      arrowOffsetTop: '50%'
    });
    const tree = mount(<Position placement="bottom" target={target}><div>test</div></Position>);

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
    assert.deepEqual(stub.getCall(1).args, ['bottom', ReactDOM.findDOMNode(tree.instance()), ReactDOM.findDOMNode(target), document.body, 10, 0, 0]);

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
    tree.unmount();
  });
});
