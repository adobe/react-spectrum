import ArrowDownSmall from '../../src/Icon/core/ArrowDownSmall';
import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import TableCell from '../../src/TableView/js/TableCell';

describe('TableCell', function () {
  it('should render a header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 0);
  });

  it('should render a sortable header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell is-sortable');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 1);
    assert.equal(wrapper.find(ArrowDownSmall).prop('className'), 'spectrum-Table-sortedIcon');
  });

  it('should render a sorted desc header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}} sortDir={1}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell is-sortable is-sorted-desc');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 1);
    assert.equal(wrapper.find(ArrowDownSmall).prop('className'), 'spectrum-Table-sortedIcon');
  });

  it('should render a sorted asc header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}} sortDir={-1}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell is-sortable is-sorted-asc');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 1);
    assert.equal(wrapper.find(ArrowDownSmall).prop('className'), 'spectrum-Table-sortedIcon');
  });

  it('should render a body cell', function () {
    let wrapper = shallow(<TableCell>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-cell');
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should render a body cell with a divider', function () {
    let wrapper = shallow(<TableCell column={{divider: true}}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-cell spectrum-Table-cell--divider');
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should render a body cell aligned center', function () {
    let wrapper = shallow(<TableCell column={{align: 'center'}}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-cell spectrum-Table-cell--alignCenter');
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should render a body cell aligned right', function () {
    let wrapper = shallow(<TableCell column={{align: 'right'}}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-cell spectrum-Table-cell--alignRight');
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should set a static width on a cell', function () {
    let wrapper = shallow(<TableCell column={{width: 100}}>test</TableCell>);
    let style = wrapper.prop('style');
    assert.equal(style.width, 100);
    assert.equal(style.flexShrink, 0);
  });

  it('should set a static minimum width on a cell', function () {
    let wrapper = shallow(<TableCell column={{minWidth: 100}}>test</TableCell>);
    let style = wrapper.prop('style');
    assert.equal(style.minWidth, 100);
    assert.equal(style.flexGrow, 1);
  });

  it('should set a static maximum width on a cell', function () {
    let wrapper = shallow(<TableCell column={{maxWidth: 100}}>test</TableCell>);
    let style = wrapper.prop('style');
    assert.equal(style.maxWidth, 100);
    assert.equal(style.flexGrow, 1);
  });

  it('should pass through a custom class name', function () {
    let wrapper = shallow(<TableCell className="test">test</TableCell>);
    assert.equal(wrapper.prop('className'), 'test spectrum-Table-cell');
  });
});
