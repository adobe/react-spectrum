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
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {Tab, TabView} from '../../src/TabView';
import {TabList} from '../../src/TabList';

describe('TabView', function () {
  it('renders a tab list and the selected tab body', function () {
    const tree = shallow(
      <TabView>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
      </TabView>
    );

    assert.equal(tree.prop('className'), 'react-spectrum-TabView react-spectrum-TabView--horizontal');
    assert.equal(tree.find(TabList).prop('selectedIndex'), 0);
    assert.equal(tree.find('.react-spectrum-TabView-body').text(), 'Tab 1');
  });

  it('clicking on a tab changes the tab body', function () {
    const onSelect = sinon.spy();
    const tree = shallow(
      <TabView onSelect={onSelect}>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
      </TabView>
    );

    assert.equal(tree.find(TabList).prop('selectedIndex'), 0);
    assert.equal(tree.find('.react-spectrum-TabView-body').text(), 'Tab 1');

    tree.find(TabList).simulate('change', 1);

    assert.equal(tree.find(TabList).prop('selectedIndex'), 1);
    assert.equal(tree.find('.react-spectrum-TabView-body').text(), 'Tab 2');

    assert(onSelect.calledOnce);
    assert.equal(onSelect.lastCall.args[0], 1);
  });

  it('does not change state in controlled mode', function () {
    const onSelect = sinon.spy();
    const tree = shallow(
      <TabView onSelect={onSelect} selectedIndex={1}>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
      </TabView>
    );

    assert.equal(tree.find(TabList).prop('selectedIndex'), 1);
    assert.equal(tree.find('.react-spectrum-TabView-body').text(), 'Tab 2');

    tree.find(TabList).simulate('change', 0);

    assert.equal(tree.find(TabList).prop('selectedIndex'), 1);
    assert.equal(tree.find('.react-spectrum-TabView-body').text(), 'Tab 2');

    assert(onSelect.calledOnce);
    assert.equal(onSelect.lastCall.args[0], 0);
  });

  it('changing the children resets the selected index', function () {
    const tree = shallow(
      <TabView>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
      </TabView>
    );

    tree.find(TabList).simulate('change', 1);

    tree.setProps({
      children: [
        <Tab label="Hi">Hi</Tab>
      ]
    });

    assert.equal(tree.find(TabList).prop('selectedIndex'), 0);
  });

  it('children should have renderChildren prop and allow null in children', function () {
    const tree = shallow(
      <TabView>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
        {null}
      </TabView>
    );

    assert.equal(tree.find(Tab).at(0).prop('renderChildren'), false);
  });

  it('supports defaultSelectedIndex', () => {
    const tree = mount(
      <TabView defaultSelectedIndex={1}>
        <Tab label="Foo">Tab 1</Tab>
        <Tab label="Bar">Tab 2</Tab>
      </TabView>
    );
    const child = tree.find('[selected=true]');
    assert.equal(child.length, 1);
    assert.equal(child.prop('label'), 'Bar');
    tree.unmount();
  });
});
