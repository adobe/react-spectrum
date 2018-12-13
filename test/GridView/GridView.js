import assert from 'assert';
import GridItem from '../../src/GridView/js/GridItem';
import {GridLayout, GridView} from '../../src/GridView';
import ListDataSource from '../../src/ListDataSource';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('GridView', function () {
  class TestDS extends ListDataSource {
    load() {
      return [
        {active: true, name: 'test'},
        {active: false, name: 'foo'},
        {active: true, name: 'bar'},
        {active: false, name: 'baz'},
      ];
    }
  }

  let ds = new TestDS;
  function renderItem(item) {
    return <span>{item.name}</span>;
  }

  it('should render a collection view', function () {
    let wrapper = shallow(
      <GridView
        layout={GridLayout}
        dataSource={ds}
        renderItem={renderItem} />
    );

    assert.equal(wrapper.prop('className'), 'react-spectrum-GridView');
    assert.equal(wrapper.prop('role'), 'grid');
    assert.equal(wrapper.prop('aria-multiselectable'), true);
    assert(wrapper.prop('layout') instanceof GridLayout, 'layout is an instanceof GridLayout');
    assert.equal(wrapper.prop('canSelectItems'), true);
    assert.equal(wrapper.prop('allowsMultipleSelection'), true);
  });

  it('should use a layout instance', function () {
    let layout = new GridLayout;
    let wrapper = shallow(
      <GridView
        layout={layout}
        dataSource={ds}
        renderItem={renderItem} />
    );

    assert.equal(wrapper.prop('layout'), layout);
  });

  it('wraps items in a GridItem', function () {
    let wrapper = shallow(
      <GridView
        layout={GridLayout}
        dataSource={ds}
        renderItem={renderItem} />
    );

    let item = wrapper.wrap(wrapper.prop('renderItemView')('item', {name: 'foo'}));
    assert.equal(item.type(), GridItem);
  });

  it('should fire an onSelectionChange event', function () {
    let onSelectionChange = sinon.spy();
    let wrapper = shallow(
      <GridView
        layout={GridLayout}
        dataSource={ds}
        renderItem={renderItem}
        onSelectionChange={onSelectionChange} />
    );

    wrapper.simulate('selectionChanged');
    assert(onSelectionChange.calledOnce);
  });
});
