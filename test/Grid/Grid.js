import assert from 'assert';
import Grid from '../../src/Grid/js/Grid';
import React from 'react';
import {shallow} from 'enzyme';

describe('Grid', () => {
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

  it('supports fixed variant', () => {
    const tree = shallow(render({variant: 'fixed'}));
    assert.equal(tree.hasClass('spectrum-grid--fixed'), true);
  });

  it('supports fluid variant', () => {
    const tree = shallow(render({variant: 'fluid'}));
    assert.equal(tree.hasClass('spectrum-grid--fluid'), true);
  });

});

const render = ({children, ...otherProps}) => (
  <Grid {...otherProps}>{children}</Grid>
);
