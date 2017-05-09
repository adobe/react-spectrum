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
    assert.equal(tree.prop('className'), 'coral-InlineEditor coral-InlineEditor-label');
    assert.equal(tree.text(), 'test');
  });

  it('should render a textfield on double click', () => {
    const tree = shallow(<InlineEditor value="test" />);
    assert.equal(tree.type(), 'span');

    tree.simulate('doubleClick');

    assert.equal(tree.type(), Textfield);
    assert.equal(tree.prop('className'), 'coral-InlineEditor coral-InlineEditor-input');
    assert.equal(tree.prop('value'), 'test');
  });

  it('should support custom classnames', () => {
    const tree = shallow(<InlineEditor value="test" className="foo" />);
    assert(tree.hasClass('foo'));

    tree.simulate('doubleClick');
    assert(tree.hasClass('foo'));
  });

  it('should save the value on enter', () => {
    const onChange = sinon.spy();
    const tree = shallow(<InlineEditor defaultValue="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    assert.equal(tree.type(), 'span');
    assert.equal(tree.text(), 'foo');

    assert(onChange.calledOnce);
    assert.equal(onChange.lastCall.args[0], 'foo');
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

  it('should not set state on save in controlled mode', () => {
    const onChange = sinon.spy();
    const tree = shallow(<InlineEditor value="test" onChange={onChange} />);

    tree.simulate('doubleClick');
    assert.equal(tree.prop('value'), 'test');

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');

    tree.simulate('keyDown', {key: 'Enter'});
    assert.equal(tree.type(), 'span');
    assert.equal(tree.text(), 'test');

    assert(onChange.calledOnce);
    assert.equal(onChange.lastCall.args[0], 'foo');
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
