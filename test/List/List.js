import assert from 'assert';
import {List} from '../../src/List';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

const render = (props = {}) => {
  const defaultProps = {
    children: [
      <div>foo</div>,
      <div>bar</div>,
      <div>baz</div>,
    ],
  };

  return <List {...defaultProps} {...props} />;
};

describe('List', () => {
  it('calls onSelect when a child List element call onSelect', () => {
    const spy = sinon.spy();
    const tree = shallow(render({onSelect: spy}));
    tree.find('div').first().prop('onSelect')('test');
    assert.equal(spy.getCall(0).args[0], 'test');
  });

  it('supports additional classNames', () => {
    const tree = shallow(render({className: 'foo'}));
    assert(tree.prop('className').indexOf('foo') >= 0);
  });

  it('supports additional properties', () => {
    const tree = shallow(render({foo: 'bar'}));
    assert.equal(tree.prop('foo'), 'bar');
  });
});
