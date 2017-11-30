import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {TabList} from '../../src/TabList';

describe('TabList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<TabList />, {disableLifecycleMethods: true});
    const innerTree = tree.shallow();
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--horizontal spectrum-TabList--panel');
    assert.equal(innerTree.type(), 'div');
    assert.equal(innerTree.prop('role'), 'tablist');
  });

  it('supports large size', () => {
    const tree = shallow(<TabList size="L" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--large spectrum-TabList--horizontal spectrum-TabList--panel');
  });

  it('supports vertical orientation', () => {
    const tree = shallow(<TabList orientation="vertical" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--vertical spectrum-TabList--panel');
  });

  it('supports anchored variant', () => {
    const tree = shallow(<TabList variant="anchored" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--horizontal spectrum-TabList--anchored');
  });

  it('supports page variant', () => {
    const tree = shallow(<TabList variant="page" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--horizontal spectrum-TabList--page');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<TabList className="myClass" />, {disableLifecycleMethods: true});
    assert.equal(tree.prop('className'), 'spectrum-TabList spectrum-TabList--horizontal spectrum-TabList--panel myClass');
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


  it('supports defaultSelectedIndex', () => {
    const tree = shallow(
      <TabList defaultSelectedIndex="1">
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
      <TabList defaultSelectedIndex="0" onChange={onChange}>
        <div>a <input type="checkbox" /></div>
      </TabList>, {disableLifecycleMethods: true}
    );

    tree.find('input').simulate('change');

    assert(!onChange.called);
  });
});
