import assert from 'assert';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import TreeItem from '../../src/TreeView/js/TreeItem';

let root = {
  children: [
    {item: 'world'}
  ]
};

describe('TreeItem', function () {
  it('should render a non-toggleable item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{isToggleable: false, item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');
    let icon = wrapper.find(ChevronRightMedium);
    let span = wrapper.find('span');

    assert.equal(wrapper.prop('className'), 'spectrum-TreeView-item');
    assert.equal(link.length, 1);
    assert.equal(icon.length, 0);
    assert.equal(span.length, 1);
    assert.equal(span.text(), 'world');
  });

  it('should render a toggleable item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{hasChildren: true, isToggleable: true, item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');
    let icon = wrapper.find(ChevronRightMedium);
    let span = wrapper.find('span');

    assert.equal(wrapper.prop('className'), 'spectrum-TreeView-item');
    assert.equal(link.length, 1);
    assert.equal(icon.length, 1);
    assert.equal(icon.prop('className'), 'spectrum-TreeView-indicator');
    assert.equal(span.length, 1);
    assert.equal(span.text(), 'world');
  });

  it('should render an open item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let content = {index: 0, hasChildren: true, isToggleable: true, isExpanded: true, item: 'world', children: [{item: 'Child 1'}, {item: 'Child 2'}], parent: root};
    let wrapper = shallow(
      <TreeItem
        content={content}
        renderItem={renderItem}
        onToggle={onToggle}
        collectionView={{visibleViews: [{content: {parent: content}}]}} />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');
    let icon = wrapper.find(ChevronRightMedium);
    let span = wrapper.find('span');

    assert.equal(wrapper.prop('className'), 'spectrum-TreeView-item is-open');
    assert.equal(link.length, 1);
    assert.equal(icon.length, 1);
    assert.equal(icon.prop('className'), 'spectrum-TreeView-indicator');
    assert.equal(span.length, 2);
    assert.equal(span.at(0).text(), 'world');
    assert.equal(span.at(1).prop('role'), 'group');
    assert.equal(span.at(1).prop('className'), 'u-react-spectrum-screenReaderOnly');
    assert.equal(span.at(1).prop('id'), link.prop('aria-owns'));
    assert.equal(span.at(1).prop('aria-labelledby'), link.prop('id'));
    assert.equal(span.at(1).prop('aria-owns'), wrapper.instance().getOwnedChildIds());
  });

  it('should render a selected item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle}
        allowsSelection
        selected />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');

    assert.equal(link.length, 1);
    assert(link.hasClass('is-selected'));
  });

  it('should render a drop-target item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle}
        drop-target />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');

    assert.equal(link.length, 1);
    assert(link.hasClass('is-drop-target'));
  });

  it('should pass tree item as a second argument to renderItem', function () {
    let renderItem = (item, content) => <span>{content.isLoading ? 'loading' : item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{item: 'world', isLoading: true, parent: root}}
        renderItem={renderItem}
        onToggle={onToggle}
        drop-target />
    );

    let span = wrapper.find('span');

    assert.equal(span.length, 1);
    assert.equal(span.text(), 'loading');
  });

  it('should support clicking anywhere on the item to toggle it if selection is not enabled', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{hasChildren: true, isToggleable: true, item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');
    let icon = wrapper.find(ChevronRightMedium);

    icon.simulate('click');
    assert(!onToggle.called);

    link.simulate('click');
    assert(onToggle.calledOnce);
    assert.equal(onToggle.getCall(0).args[0], 'world');
  });

  it('should support clicking only on the chevron to toggle if selection is enabled', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{hasChildren: true, isToggleable: true, item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle}
        allowsSelection />
    );

    let link = wrapper.find('.spectrum-TreeView-itemLink');
    let icon = wrapper.find(ChevronRightMedium);

    link.simulate('click');
    assert(!onToggle.called);

    icon.simulate('click');
    assert(onToggle.calledOnce);
    assert.equal(onToggle.getCall(0).args[0], 'world');
  });

  it('should stop propagation on mouse down on the chevron so selection does not occur', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{hasChildren: true, isToggleable: true, item: 'world', parent: root}}
        renderItem={renderItem}
        onToggle={onToggle}
        allowsSelection />
    );

    let icon = wrapper.find(ChevronRightMedium);
    let stopPropagation = sinon.spy();
    let preventDefault = sinon.spy();
    icon.simulate('mousedown', {stopPropagation, preventDefault});

    assert(stopPropagation.calledOnce);
    assert(preventDefault.calledOnce);
  });

  describe('focus', () => {
    it('should call focus on treeitem ref', () => {
      let renderItem = (item) => <span>{item}</span>;
      let wrapper = shallow(
        <TreeItem
          content={{hasChildren: true, isToggleable: true, item: 'world', parent: root}}
          renderItem={renderItem} />
      );
      wrapper.instance().treeitem = {
        focus: sinon.spy()
      };
      wrapper.instance().focus();
      assert(wrapper.instance().treeitem.focus.calledOnce);
    });
  });
});
