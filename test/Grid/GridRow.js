import assert from 'assert';
import GridRow from '../../src/Grid/js/GridRow';
import React from 'react';
import {shallow} from 'enzyme';

describe('GridRow', () => {
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

  it('supports align start', () => {
    const tree = shallow(render({align: {xs: 'start'}}));
    assert.equal(tree.hasClass('spectrum-grid-start-xs'), true);
  });

  it('supports align center', () => {
    const tree = shallow(render({align: {md: 'center'}}));
    assert.equal(tree.hasClass('spectrum-grid-center-md'), true);
  });

  it('supports align start', () => {
    const tree = shallow(render({align: {xl: 'end'}}));
    assert.equal(tree.hasClass('spectrum-grid-end-xl'), true);
  });

  it('supports align top', () => {
    const tree = shallow(render({align: {lg: 'top'}}));
    assert.equal(tree.hasClass('spectrum-grid-top-lg'), true);
  });

  it('supports align middle', () => {
    const tree = shallow(render({align: {sm: 'middle'}}));
    assert.equal(tree.hasClass('spectrum-grid-middle-sm'), true);
  });

  it('supports align start', () => {
    const tree = shallow(render({align: {xl: 'start'}}));
    assert.equal(tree.hasClass('spectrum-grid-start-xl'), true);
  });

  it('supports reverse', () => {
    const tree = shallow(render({reverse: true}));
    assert.equal(tree.hasClass('spectrum-grid-reverse'), true);
  });

  it('supports around distribution', () => {
    const tree = shallow(render({distribution: 'around'}));
    assert.equal(tree.hasClass('spectrum-grid-around-lg'), true);
  });

  it('supports between distribution', () => {
    const tree = shallow(render({distribution: 'between'}));
    assert.equal(tree.hasClass('spectrum-grid-between-md'), true);
  });
});

const render = ({children, ...otherProps}) => (
  <GridRow {...otherProps}>{children}</GridRow>
);
