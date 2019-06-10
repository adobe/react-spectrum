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
import {Tab, TabList} from '../../src/TabList';
import * as utils from '../../src/TabList/js/getBoundingClientRect';

describe('TabList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<TabList />, {disableLifecycleMethods: true});
    const innerTree = tree.shallow().shallow();
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal');
    assert.equal(innerTree.type(), 'div');
    assert.equal(innerTree.prop('role'), 'tablist');
  });

  it('supports vertical orientation', () => {
    const tree = shallow(<TabList orientation="vertical" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--vertical');
  });

  it('renders normally when anchored is passed', () => {
    const tree = shallow(<TabList variant="anchored" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal');
  });

  it('renders normally when panel is passed', () => {
    const tree = shallow(<TabList variant="panel" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal');
  });

  it('renders compact when page is passed', () => {
    const tree = shallow(<TabList variant="page" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--compact');
  });

  it('supports compact variant', () => {
    const tree = shallow(<TabList variant="compact" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--compact');
  });

  it('supports quiet variant', () => {
    const tree = shallow(<TabList quiet />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--quiet');
  });

  it('supports quiet compact variant', () => {
    const tree = shallow(<TabList quiet variant="compact" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal spectrum-Tabs--quiet spectrum-Tabs--compact');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<TabList className="myClass" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-Tabs spectrum-Tabs--horizontal myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<TabList foo />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<TabList><div className="someContent">My Custom Content</div></TabList>, {disableLifecycleMethods: true});
    const child = tree.find('.someContent');
    assert.equal(child.length, 1);
    assert.equal(child.children().text(), 'My Custom Content');
  });

  it('can be changed', () => {
    const spy = sinon.spy();
    const tree = shallow(
      <TabList onChange={spy}>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>, {disableLifecycleMethods: true}
    );
    const innerTree = tree.shallow();

    const child = innerTree.find('.two');
    child.simulate('click');

    assert(spy.calledWith(1));
  });

  describe('selectedKey', () => {
    const renderTabListWithSelectedIndex = index => shallow(
      <TabList selectedIndex={index}>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>, {disableLifecycleMethods: true}
    );

    const assertChildTwoSelected = tree => {
      const child = tree.find('[selected=true]');
      assert.equal(child.length, 1);
      assert.equal(child.prop('className'), 'two');
    };

    it('supports string index', () => {
      const tree = renderTabListWithSelectedIndex('1');
      const innerTree = tree.shallow();
      assertChildTwoSelected(innerTree);
    });

    it('supports integer index', () => {
      const tree = renderTabListWithSelectedIndex(1);
      const innerTree = tree.shallow();
      assertChildTwoSelected(innerTree);
    });
  });

  it('does not control state if selectedIndex is defined', () => {
    const onChange = sinon.spy();

    const tree = shallow(
      <TabList selectedIndex="0" onChange={onChange}>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>, {disableLifecycleMethods: true}
    );

    const innerTree = tree.shallow();

    const child = innerTree.find('.two');
    child.simulate('click');

    assert.equal(tree.props().selectedIndex, 0);
  });

  it('supports defaultSelectedIndex', () => {
    const tree = shallow(
      <TabList defaultSelectedIndex={1}>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>, {disableLifecycleMethods: true}
    );
    const innerTree = tree.shallow();
    const child = innerTree.find('[selected=true]');

    assert.equal(child.length, 1);
    assert.equal(child.prop('className'), 'two');
  });

  it('does not call onChange if descendant input is changed', () => {
    const onChange = sinon.spy();

    const tree = shallow(
      <TabList defaultSelectedIndex={0} onChange={onChange}>
        <div>a <input type="checkbox" /></div>
      </TabList>, {disableLifecycleMethods: true}
    );

    tree.find('input').simulate('change');

    assert(!onChange.called);
  });

  it('supports mousedown/mouseup on child', () => {
    const focusSpy = sinon.spy();
    const mouseDownSpy = sinon.spy();
    const tree = shallow(
      <TabList>
        <div role="tab" tabIndex={0} className="one">a</div>
        <div role="tab" tabIndex={0} className="two" onMouseDown={mouseDownSpy}>b</div>
      </TabList>, {disableLifecycleMethods: true}
    );
    const innerTree = tree.shallow();

    const child = innerTree.find('.two');
    child.simulate('mousedown', {currentTarget: {focus: focusSpy}});
    assert(mouseDownSpy.called);
    assert(focusSpy.called);
    assert(innerTree.instance().isMouseDown);
    let event = new window.MouseEvent('mouseup');
    window.dispatchEvent(event);
    assert(!innerTree.instance().isMouseDown);
  });

  it('supports onClick on child', () => {
    const keyDownSpy = sinon.spy();
    const focusSpy = sinon.spy();
    const spy = sinon.spy();
    const tree = shallow(
      <TabList>
        <div role="tab" tabIndex={0} className="one">a</div>
        <div role="tab" tabIndex={0} className="two" onClick={spy} onKeyDown={keyDownSpy}>b</div>
      </TabList>, {disableLifecycleMethods: true}
    );
    const innerTree = tree.shallow();

    const child = innerTree.find('.two');
    child.simulate('click', {currentTarget: {focus: focusSpy}});
    assert(spy.called);
  });
  describe('mounted tests', () => {
    let tree;
    afterEach(() => {
      if (tree) {
        tree.unmount();
        tree = null;
      }
    });
    it('supports dynamic setting of props', () => {
      tree = mount(
        <TabList>
          <Tab className="one">a</Tab>
          <Tab className="two">b</Tab>
        </TabList>
      );
      tree.setProps({selectedIndex: 1});
      const child = tree.find('[selected=true]');

      assert.equal(child.length, 1);
      assert.notEqual(child.prop('className').indexOf('two'), -1);
    });


    it('supports selectedIndex by setting selected on child', () => {
      tree = mount(
        <TabList>
          <Tab className="one">a</Tab>
          <Tab className="two" selected>b</Tab>
        </TabList>
      );
      const child = tree.find('[selected=true]');
      assert.equal(child.length, 1);
      assert.notEqual(child.prop('className').indexOf('two'), -1);
    });

    it('supports selection on focus when keyboardActivation="automatic"', () => {
      const focusSpy = sinon.spy();
      tree = mount(
        <TabList>
          <Tab tabIndex={0} className="one">a</Tab>
          <Tab tabIndex={0} className="two" onFocus={focusSpy}>b</Tab>
        </TabList>
      );

      let child = tree.find('.spectrum-Tabs-item.two');
      child.simulate('focus');
      assert(focusSpy.calledWith(1));

      tree.update();

      assert(tree.state('selectedIndex'), 1);

      child = tree.find('[selected=true]');
      assert.notEqual(child.prop('className').indexOf('two'), -1);

      tree.setProps({
        keyboardActivation: 'manual'
      });

      tree.setState({
        selectedIndex: 0
      });

      tree.update();

      assert.equal(tree.prop('keyboardActivation'), 'manual');

      child = tree.find('.spectrum-Tabs-item.two');
      child.simulate('focus');
      assert(focusSpy.calledWith(1));

      assert.equal(tree.state('selectedIndex'), 0);

      child = tree.find('[selected=true]');
      assert.notEqual(child.prop('className').indexOf('one'), -1);
    });

    it('finds a new tab if the currently selected one is removed', () => {
      let onChangeSpy = sinon.spy();
      tree = mount(
        <TabList onChange={onChangeSpy}>
          <Tab className="one">a</Tab>
          <Tab className="two">b</Tab>
        </TabList>
      );
      let tabs = tree.find(Tab);
      tabs.at(1).simulate('click');
      let selectedTab = tree.find('[selected=true]');
      assert(selectedTab.prop('className').includes('two'));
      tree.setProps({children: <Tab className="one">a</Tab>});
      tree.update();
      selectedTab = tree.find('[selected=true]');
      assert(selectedTab.prop('className').includes('one'));
      assert.equal(onChangeSpy.getCall(0).args[0], 1);
      assert.equal(onChangeSpy.getCall(1).args[0], 0);
    });


    describe('is collapsible', () => {
      let boundRectStub;
      let clock;
      beforeEach(() => {
        clock = sinon.useFakeTimers();
        boundRectStub = sinon.stub(utils, 'getBoundingClientRect');
      });
      afterEach(() => {
        clock.runAll();
        clock.restore();
        boundRectStub = null;
        utils.getBoundingClientRect.restore();
      });

      it('can start off collapsed', () => {
        // set it up so that initially the tabs extend beyond the tablist container
        boundRectStub.onCall(0).returns({right: 25});
        boundRectStub.onCall(1).returns({right: 50});
        // when next called, swap them so that the tabs do fit
        boundRectStub.onCall(2).returns({right: 50});
        boundRectStub.onCall(3).returns({right: 25});
        tree = mount(
          <TabList collapsible>
            <Tab className="one">a</Tab>
            <Tab className="two">b</Tab>
          </TabList>
        );
        let tabsContainer = tree.find('div.react-spectrum-Tabs--container');
        assert(tabsContainer.prop('aria-hidden'));
        assert(tabsContainer.prop('className').includes('react-spectrum-Tabs--hidden'));
        let select = tree.find('TabListDropdown');
        assert.equal(select.props().selectedIndex, 0);
        let selectedTab = tree.find('[selected=true]');
        assert(selectedTab.prop('className').includes('one'));

        // verify that selecting something from the dropdown causes the selectedIndex to change
        let button = tree.find('Button');

        button.simulate('click', {button: 0});

        let dropdownItems = document.querySelectorAll('.spectrum-Menu-item');
        assert.equal(dropdownItems.length, 2);
        dropdownItems[1].dispatchEvent(new window.MouseEvent('click', {
          bubbles: true,
          cancelable: true
        }));

        dropdownItems = document.querySelectorAll('.spectrum-Menu-item');
        assert.equal(dropdownItems.length, 0);

        tree.update();
        select = tree.find('TabListDropdown');
        assert.equal(select.props().selectedIndex, 1);
        selectedTab = tree.find('[selected=true]');
        assert(selectedTab.prop('className').includes('two'));

        // verify that increasing the container width causes the tablist to show
        window.dispatchEvent(new window.Event('resize'));
        // resize listener is debounced, run the clock
        clock.runAll();
        tree.update();
        tabsContainer = tree.find('div.react-spectrum-Tabs--container');
        assert(!tabsContainer.prop('aria-hidden'));
        assert(!tabsContainer.prop('className').includes('react-spectrum-Tabs--hidden'));
        select = tree.find('TabListDropdown');
        assert.equal(select.length, 0);
      });

      it('can start off expanded', () => {
        // set it up so that initially the tabs are within the tablist container
        boundRectStub.onCall(0).returns({right: 50}); // tab list right side
        boundRectStub.onCall(1).returns({right: 25}); // last tab right side
        // when called again, collapse
        boundRectStub.onCall(2).returns({right: 25});
        boundRectStub.onCall(3).returns({right: 50});
        tree = mount(
          <TabList collapsible>
            <Tab>a</Tab>
            <Tab>b</Tab>
          </TabList>
        );
        let tabsContainer = tree.find('div.react-spectrum-Tabs--container');
        assert(!tabsContainer.prop('aria-hidden'));
        assert(!tabsContainer.prop('className').includes('react-spectrum-Tabs--hidden'));
        let select = tree.find('TabListDropdown');
        assert.equal(select.length, 0);

        // verify that decreasing the container width causes the tablist to hide
        window.dispatchEvent(new window.Event('resize'));
        // resize listener is debounced, run the clock
        clock.runAll();
        tree.update();
        tabsContainer = tree.find('div.react-spectrum-Tabs--container');
        assert(tabsContainer.prop('aria-hidden'));
        assert(tabsContainer.prop('className').includes('react-spectrum-Tabs--hidden'));
        select = tree.find('TabListDropdown');
        assert.equal(select.length, 1);
      });


      it('will not collapse in vertical', () => {
        // set it up so that initially the tabs extend beyond the tablist container
        boundRectStub.onCall(0).returns({right: 25});
        boundRectStub.onCall(1).returns({right: 50});

        tree = mount(
          <TabList orientation="vertical" collapsible>
            <Tab className="one">a</Tab>
            <Tab className="two">b</Tab>
          </TabList>
        );
        let tabsContainer = tree.find('div.react-spectrum-Tabs--container');
        assert.equal(tabsContainer.prop('aria-hidden'), undefined);
        assert.equal(tabsContainer.prop('className').includes('react-spectrum-Tabs--hidden'), false);
        let select = tree.find('TabListDropdown');
        assert.equal(select.length, 0);
      });
    });
  });
});
