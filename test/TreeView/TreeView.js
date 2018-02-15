import assert from 'assert';
import {EditableCollectionView} from '@react/collection-view';
import React from 'react';
import {shallow} from 'enzyme';
import TreeItem from '../../src/TreeView/js/TreeItem';
import {TreeView} from '../../src/TreeView';

describe('TreeView', function () {
  it('should render an EditableCollectionView', function () {
    let wrapper = shallow(<TreeView />);
    let collection = wrapper.find(EditableCollectionView);

    assert.equal(wrapper.length, 1);
    assert.equal(collection.length, 1);
  });

  describe('renderItemView', function () {
    it('should render a toggleable tree item', function () {
      let renderItem = (item) => <span>{item}</span>;
      let wrapper = shallow(<TreeView renderItem={renderItem} />);
      let item = wrapper.wrap(wrapper.instance().renderItemView('item', {hasChildren: true, isToggleable: true, item: 'world'}));

      assert.equal(item.type(), TreeItem);
      assert.deepEqual(item.prop('content'), {hasChildren: true, isToggleable: true, item: 'world'});
      assert.equal(item.prop('renderItem'), renderItem);
    });
  });
});
