import assert from 'assert';
import GridItem from '../../src/GridView/js/GridItem';
import React from 'react';
import {shallow} from 'enzyme';

describe('GridItem', function () {
  it('should have aria properties', function () {
    let layoutInfo = {index: 1};
    let collectionView = {focusedIndexPath: {index: 1}, layout: {cardType: 'gallery'}};
    let wrapper = shallow(<GridItem layoutInfo={layoutInfo} collectionView={collectionView}><div>test</div></GridItem>);
    assert.equal(wrapper.type(), 'div');
    assert.equal(wrapper.prop('role'), 'row');
    assert.equal(wrapper.prop('aria-rowindex'), 2);

    let cell = wrapper.childAt(0);
    assert.equal(cell.type(), 'div');
    assert.equal(cell.childAt(0).text(), 'test');
    assert.equal(cell.prop('role'), 'gridcell');
    assert.equal(cell.prop('tabIndex'), -1);
  });

  it('should support aria-selected', function () {
    let layoutInfo = {index: 1};
    let collectionView = {focusedIndexPath: {index: 1}, layout: {cardType: 'gallery'}};
    let wrapper = shallow(<GridItem layoutInfo={layoutInfo} collectionView={collectionView} selected><div>test</div></GridItem>);

    let cell = wrapper.childAt(0);
    assert.equal(cell.prop('aria-selected'), true);
  });

  it('should have tabIndex = 0 when focused', function () {
    let layoutInfo = {index: 1};
    let collectionView = {focusedIndexPath: {index: 1}, layout: {cardType: 'gallery'}};
    let wrapper = shallow(<GridItem layoutInfo={layoutInfo} collectionView={collectionView} focused><div>test</div></GridItem>);

    let cell = wrapper.childAt(0);
    assert.equal(cell.prop('tabIndex'), 0);
  });

  it('should have tabIndex = 0 when there are no items focused', function () {
    let layoutInfo = {index: 1};
    let collectionView = {focusedIndexPath: null, layout: {cardType: 'gallery'}};
    let wrapper = shallow(<GridItem layoutInfo={layoutInfo} collectionView={collectionView}><div>test</div></GridItem>);

    let cell = wrapper.childAt(0);
    assert.equal(cell.prop('tabIndex'), 0);
  });
});
