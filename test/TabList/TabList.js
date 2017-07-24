import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {TabList} from '../../src/TabList';

describe('TabList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<TabList />);
    const innerTree = tree.shallow();
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--horizontal');
    assert.equal(innerTree.type(), 'div');
    assert.equal(innerTree.prop('role'), 'tablist');
  });

  it('supports large size', () => {
    const tree = shallow(<TabList size="L" />);
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--large spectrum-TabList--horizontal');
  });

  it('supports vertical orientation', () => {
    const tree = shallow(<TabList orientation="vertical" />);
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--vertical');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<TabList className="myClass" />);
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--horizontal myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<TabList foo />);
    assert.equal(tree.prop('foo'), true);
  });

  it('supports children', () => {
    const tree = shallow(<TabList><div className="someContent">My Custom Content</div></TabList>);
    const child = tree.find('.someContent');
    assert.equal(child.length, 1);
    assert.equal(child.children().node, 'My Custom Content');
  });

  it('can be changed', () => {
    const spy = sinon.spy();
    const tree = shallow(
      <TabList onChange={spy}>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
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
      </TabList>
    );

    const assertChildTwoSelected = tree => {
      const child = tree.find('[selected=true]');
      assert.equal(child.length, 1);
      assert.equal(child.node.props.className, 'two');
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


  it('supports defaultSelectedIndex', () => {
    const tree = shallow(
      <TabList defaultSelectedIndex="1">
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
    );
    const innerTree = tree.shallow();
    const child = innerTree.find('[selected=true]');

    assert.equal(child.length, 1);
    assert.equal(child.node.props.className, 'two');
  });

  it('does not call onChange if descendant input is changed', () => {
    const onChange = sinon.spy();

    // We need to use mount instead of shallow because we need our simulated change event to
    // bubble to properly test the scenario. Simulated events don't bubble when rendering shallowly.
    const tree = mount(
      <TabList defaultSelectedIndex="0" onChange={onChange}>
        <div>a <input type="checkbox" /></div>
      </TabList>
    );

    tree.find('input').simulate('change');

    assert(!onChange.called);
  });
});
