import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import TR from '../../src/Table/js/TR';

describe('TR', () => {
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
    assert.equal(tree.childAt(0).text(), 'Foo');
  });
});

const render = ({children, ...otherProps}) => (
  <TR {...otherProps}>{children}</TR>
);
