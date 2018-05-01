import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {Tab, TabList} from '../../src/TabList';

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

  it('supports dynamic setting of props', () => {
    const tree = mount(
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
    const tree = mount(
      <TabList>
        <Tab className="one">a</Tab>
        <Tab className="two" selected>b</Tab>
      </TabList>
    );
    const child = tree.find('[selected=true]');
    assert.equal(child.length, 1);
    assert.notEqual(child.prop('className').indexOf('two'), -1);
  });

  it('supports mousedown/mouseup on child', () => {
    const focusSpy = sinon.spy();
    const mouseDownSpy = sinon.spy();
    const tree = shallow(
      <TabList>
        <div className="one">a</div>
        <div className="two" onMouseDown={mouseDownSpy}>b</div>
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
    const focusSpy = sinon.spy();
    const spy = sinon.spy();
    const tree = shallow(
      <TabList>
        <div className="one">a</div>
        <div className="two" onClick={spy}>b</div>
      </TabList>, {disableLifecycleMethods: true}
    );
    const innerTree = tree.shallow();

    const child = innerTree.find('.two');
    child.simulate('click', {currentTarget: {focus: focusSpy}});
    assert(spy.called);
  });

  it('supports selection on focus when keyboardActivation="automatic"', () => {
    const focusSpy = sinon.spy();
    const tree = shallow(
      <TabList>
        <div tabIndex={0} className="one">a</div>
        <div tabIndex={0} className="two" onFocus={focusSpy}>b</div>
      </TabList>, {disableLifecycleMethods: true}
    );
    const innerTree = tree.shallow();

    let child = innerTree.find('.two');
    child.simulate('focus');
    assert(focusSpy.calledWith(1));

    tree.update();

    assert(tree.state('selectedIndex'), 1);

    child = tree.shallow().find('[selected=true]');
    assert.notEqual(child.prop('className').indexOf('two'), -1);

    tree.setProps({
      keyboardActivation: 'manual'
    });

    tree.setState({
      selectedIndex: 0
    });

    tree.update();

    child = innerTree.find('.two');
    child.simulate('focus');
    assert(focusSpy.calledWith(1));

    assert(tree.state('selectedIndex'), 0);

    child = tree.shallow().find('[selected=true]');
    assert.notEqual(child.prop('className').indexOf('one'), -1);
  });
});
