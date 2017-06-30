import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import TBody from '../../src/Table/js/TBody';

describe('TBody', () => {
  it('supports additional classNames', () => {
    const tree = shallow(render({className: 'myClass'}));
    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(render({foo: true}));
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(render({children: 'Foo'}));
    assert.equal(tree.children().node, 'Foo');
  });
});

const render = ({children, ...otherProps}) => (
  <TBody {...otherProps}>{children}</TBody>
);
