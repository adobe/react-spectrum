import AccordionChevron from '../../Icon/core/AccordionChevron';
import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import TreeItem from '../../src/TreeView/js/TreeItem';

describe('TreeItem', function () {
  it('should render a non-toggleable item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{isToggleable: false, item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-link');
    let icon = wrapper.find(AccordionChevron);
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
        content={{hasChildren: true, isToggleable: true, item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-link');
    let icon = wrapper.find(AccordionChevron);
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
    let wrapper = shallow(
      <TreeItem
        content={{hasChildren: true, isToggleable: true, isExpanded: true, item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-link');
    let icon = wrapper.find(AccordionChevron);
    let span = wrapper.find('span');

    assert.equal(wrapper.prop('className'), 'spectrum-TreeView-item is-open');
    assert.equal(link.length, 1);
    assert.equal(icon.length, 1);
    assert.equal(icon.prop('className'), 'spectrum-TreeView-indicator');
    assert.equal(span.length, 1);
    assert.equal(span.text(), 'world');
  });

  it('should render a selected item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle}
        selected />
    );

    let link = wrapper.find('.spectrum-TreeView-link');

    assert.equal(link.length, 1);
    assert(link.hasClass('is-selected'));
  });

  it('should render a drop-target item', function () {
    let renderItem = (item) => <span>{item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle}
        drop-target />
    );

    let link = wrapper.find('.spectrum-TreeView-link');

    assert.equal(link.length, 1);
    assert(link.hasClass('is-drop-target'));
  });

  it('should pass tree item as a second argument to renderItem', function () {
    let renderItem = (item, content) => <span>{content.isLoading ? 'loading' : item}</span>;
    let onToggle = sinon.spy();
    let wrapper = shallow(
      <TreeItem
        content={{item: 'world', isLoading: true}}
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
        content={{hasChildren: true, isToggleable: true, item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle} />
    );

    let link = wrapper.find('.spectrum-TreeView-link');
    let icon = wrapper.find('.spectrum-TreeView-indicator');

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
        content={{hasChildren: true, isToggleable: true, item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle}
        allowsSelection />
    );

    let link = wrapper.find('.spectrum-TreeView-link');
    let icon = wrapper.find('.spectrum-TreeView-indicator');

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
        content={{hasChildren: true, isToggleable: true, item: 'world'}}
        renderItem={renderItem}
        onToggle={onToggle}
        allowsSelection />
    );

    let icon = wrapper.find('.spectrum-TreeView-indicator');
    let stopPropagation = sinon.spy();
    icon.simulate('mousedown', {stopPropagation});

    assert(stopPropagation.calledOnce);
  });
});
