/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import Column from '../../src/ColumnView/js/Column';
import {ColumnView} from '../../src/ColumnView';
import {data, renderItem, TestDS, TreeDS} from './utils';
import {IndexPath} from '@react/collection-view';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {sleep} from '../utils';

describe('ColumnView', () => {
  let ds;
  beforeEach(async function () {
    ds = new TestDS;
    await ds.navigateToItem(null);
  });

  it('passes default props to Column', () => {
    const tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} />, {disableLifecycleMethods: true});
    assert(tree.hasClass('spectrum-MillerColumns'));
    let col = tree.find(Column);

    assert.equal(col.length, 1);
    assert.equal(tree.find(Column).prop('allowsSelection'), false);
    assert.equal(tree.find(Column).prop('allowsBranchSelection'), false);
  });

  it('renders a detail column', async () => {
    let renderDetail = sinon.spy();
    const tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} renderDetail={renderDetail} />, {disableLifecycleMethods: true});
    assert(!renderDetail.called);

    await ds.navigateToItem(data[1]);
    assert(tree.find(Column));
    assert(tree.find('.spectrum-MillerColumns-item'));
    assert(renderDetail.calledTwice);
    await ds.navigateToItem(null);
  });

  it('calls the selectionChange prop', async () => {
    let onSelectionChange = sinon.spy();
    shallow(<ColumnView dataSource={ds} renderItem={renderItem} onSelectionChange={onSelectionChange} />, {disableLifecycleMethods: true});

    await ds.setSelected([data[1]]);
    assert(onSelectionChange.calledOnce);
  });

  it('calls the onNavigate prop', async () => {
    let onNavigate = sinon.spy();
    let wrapper = mount(<ColumnView dataSource={ds} renderItem={renderItem} onNavigate={onNavigate} />);
    let instance = wrapper.instance();
    assert.equal(instance.mounted, true);

    // Navigate to the first column then the 2nd
    await ds.navigateToItem(data[0]);
    await ds.navigateToItem(data[0].children[0]);
    await sleep(50);
    let col = wrapper.find(Column).last().instance();
    if (col.collection.focusedIndexPath) {
      assert(col.collection.focusedIndexPath.equals(new IndexPath(0, 0)));
    }
    assert.equal(wrapper.state('focusedColumnIndex'), 1);

    assert.equal(onNavigate.callCount, 4);
    assert.deepEqual(onNavigate.getCall(0).args[0], [data[0]]);
    assert.deepEqual(onNavigate.getCall(onNavigate.callCount - 1).args[0][0], data[0]);
    assert.deepEqual(onNavigate.getCall(onNavigate.callCount - 1).args[0][1], data[0].children[0]);
    wrapper.unmount();
    assert.equal(instance.mounted, false);
  });

  it('should set the selected items if passed', async () => {
    class Test extends TestDS {
      isItemEqual(a, b) {
        return a.label === b.label;
      }
    }

    let ds = new Test;

    shallow(<ColumnView dataSource={ds} renderItem={renderItem} selectedItems={[{label: 'Child 1'}]} />, {disableLifecycleMethods: true});
    assert.equal(ds.isSelected({label: 'Child 1'}), true);
  });

  it('should work with a TreeDataSource', async () => {
    let ds = new TreeDS;
    let tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} />, {disableLifecycleMethods: true});
    await sleep(100);
    let col = tree.find(Column);
    assert.equal(col.length, 1);
    assert.equal(col.prop('item').children.getSectionLength(0), 2);
  });

  describe('navigatedPath', function () {
    it('should navigate to a nested item', async function () {
      let tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} navigatedPath={[data[0], data[0].children[0]]} />, {disableLifecycleMethods: true});
      await sleep(100);
      let col = tree.find(Column);
      assert.equal(col.length, 3);
    });

    it('should navigate to a nested item using isItemEqual comparator', async function () {
      let tree = shallow(<ColumnView dataSource={ds} renderItem={renderItem} navigatedPath={[{label: 'Test 1'}, {label: 'Child 1'}]} />, {disableLifecycleMethods: true});
      await sleep(100);
      let col = tree.find(Column);
      assert.equal(col.length, 3);
    });
  });

  describe('Accessibility', () => {
    it('should have role="tree"', () => {
      let wrapper = shallow(<ColumnView dataSource={ds} renderItem={renderItem} />, {disableLifecycleMethods: true});
      assert.equal(wrapper.prop('role'), 'tree');
    });

    it('should have aria-multiselectable="true"', () => {
      let wrapper = shallow(<ColumnView dataSource={ds} renderItem={renderItem} />, {disableLifecycleMethods: true});
      assert.equal(wrapper.prop('aria-multiselectable'), false);
      wrapper.setProps({allowsSelection: true});
      assert.equal(wrapper.prop('aria-multiselectable'), true);
    });
  });
});
