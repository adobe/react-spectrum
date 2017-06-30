import React from 'react';
import assert from 'assert';
import {shallow} from 'enzyme';
import TD from '../../src/Table/js/TD';

describe('TD', () => {
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
  <TD {...otherProps}>{children}</TD>
);
