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
import InlineEditor from '../../src/InlineEditor';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import Textfield from '../../src/Textfield';

describe('InlineEditor', () => {
  it('should render a label by default', () => {
    const tree = shallow(<InlineEditor value="test" />);
    assert.equal(tree.type(), 'span');
    assert.equal(tree.prop('className'), 'react-spectrum-InlineEditor react-spectrum-InlineEditor-label');
    assert.equal(tree.text(), 'test');
  });

  it('should render a textfield in autofocus mode', () => {
    const tree = shallow(<InlineEditor value="test" autoFocus />);
    assert.equal(tree.type(), Textfield);
    assert.equal(tree.prop('className'), 'react-spectrum-InlineEditor react-spectrum-InlineEditor-input');
    assert.equal(tree.prop('value'), 'test');
  });

  it('should render a textfield on double click', () => {
    const tree = shallow(<InlineEditor value="test" />);
    assert.equal(tree.type(), 'span');

    tree.simulate('doubleClick');

    assert.equal(tree.type(), Textfield);
    assert.equal(tree.prop('className'), 'react-spectrum-InlineEditor react-spectrum-InlineEditor-input');
    assert.equal(tree.prop('value'), 'test');
  });

  it('should support custom classnames', () => {
    const tree = shallow(<InlineEditor value="test" className="foo" />);
    assert(tree.hasClass('foo'));

    tree.simulate('doubleClick');
    assert(tree.hasClass('foo'));
  });

  it('should save the value on enter', (done) => {
    const onChange = sinon.spy();
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    setImmediate(() => {
      tree.update();
      assert.equal(tree.type(), 'span');
      assert.equal(tree.text(), 'foo');

      assert(onChange.calledOnce);
      assert.equal(onChange.lastCall.args[0], 'foo');
      done();
    });
  });

  it('should save the value on enter when onChange returns success in validate mode', (done) => {
    const onChange = sinon.stub();
    onChange.resolves(true);
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    setImmediate(() => {
      tree.update();
      assert.equal(tree.type(), 'span');
      assert.equal(tree.text(), 'foo');

      sinon.assert.calledOnce(onChange);
      assert.equal(onChange.lastCall.args[0], 'foo');
      done();
    });
  });

  it('should remain a textfield on enter when onChange returns failure in validate mode', (done) => {
    const onChange = sinon.stub();
    onChange.resolves(false);
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    setImmediate(() => {
      tree.update();
      assert.equal(tree.type(), Textfield);
      assert.equal(tree.prop('value'), 'foo');
      assert.equal(tree.prop('invalid'), true);

      sinon.assert.calledOnce(onChange);
      assert.equal(onChange.lastCall.args[0], 'foo');
      done();
    }, 0);
  });

  it('should not execute onCancel hook on Enter', (done) => {
    const onChange = sinon.spy();
    const handleCancel = sinon.spy();
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} onCancel={handleCancel} />);

    tree.simulate('doubleClick');

    tree.simulate('change', 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    setImmediate(() => {
      tree.update();

      sinon.assert.notCalled(handleCancel);
      assert(onChange.calledOnce);

      done();
    });
  });

  it('should execute onCancel hook on Escape key down', () => {
    const onChange = sinon.spy();
    const handleCancel = sinon.spy();
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} onCancel={handleCancel} />);

    tree.simulate('doubleClick');

    tree.simulate('change', 'foo');

    tree.simulate('keyDown', {key: 'Escape'});

    sinon.assert.notCalled(onChange);
    sinon.assert.called(handleCancel);
  });

  it('should revert to the previous value on escape', () => {
    const onChange = sinon.spy();
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Escape'});
    assert.equal(tree.type(), 'span');
    assert.equal(tree.text(), 'test');

    assert(onChange.notCalled);
  });

  it('should not set state on save in controlled mode', (done) => {
    const onChange = sinon.spy();
    const tree = shallow(<InlineEditor value="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    setImmediate(() => {
      tree.update();
      assert.equal(tree.type(), 'span');
      assert.equal(tree.text(), 'test');

      assert(onChange.calledOnce);
      assert.equal(onChange.lastCall.args[0], 'foo');
      done();
    });
  });

  it('should update the value on value prop change', () => {
    const tree = shallow(<InlineEditor value="test" />);
    assert.equal(tree.text(), 'test');
    tree.setProps({value: 'hi'});
    assert.equal(tree.text(), 'hi');
  });

  it('should not update the value on defaultValue prop change', () => {
    const tree = shallow(<InlineEditor defaultValue="test" />);
    assert.equal(tree.text(), 'test');
    tree.setProps({defaultValue: 'hi'});
    assert.equal(tree.text(), 'test');
  });
});
