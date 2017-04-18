import React from 'react';
import expect, {createSpy} from 'expect';
import {shallow, mount} from 'enzyme';
import TabList from '../../src/TabList';

describe('TabList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<TabList />);
    const innerTree = tree.shallow();
    expect(tree.prop('className')).toBe('coral-TabList');
    expect(innerTree.type()).toBe('div');
    expect(innerTree.prop('role')).toBe('tablist');
  });

  it('supports large size', () => {
    const tree = shallow(<TabList size="L" />);
    expect(tree.prop('className')).toBe('coral-TabList coral-TabList--large');
  });

  it('supports vertical orientation', () => {
    const tree = shallow(<TabList orientation="vertical" />);
    expect(tree.prop('className')).toBe('coral-TabList coral-TabList--vertical');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<TabList className="myClass" />);
    expect(tree.prop('className'))
      .toBe('coral-TabList myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<TabList foo />);
    expect(tree.prop('foo')).toBe(true);
  });

  it('supports children', () => {
    const tree = shallow(<TabList><div className="someContent">My Custom Content</div></TabList>);
    const child = tree.find('.someContent');
    expect(child.length).toBe(1);
    expect(child.children().node).toBe('My Custom Content');
  });

  it('can be changed', () => {
    const spy = createSpy();
    const tree = shallow(
      <TabList onChange={ spy }>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
    );
    const innerTree = tree.shallow();

    const child = innerTree.find('.two');
    child.simulate('click');

    expect(spy).toHaveBeenCalledWith(1);
  });

  describe('selectedKey', () => {
    const renderTabListWithSelectedIndex = index => shallow(
      <TabList selectedIndex={ index }>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
    );

    const assertChildTwoSelected = tree => {
      const child = tree.find('[selected=true]');
      expect(child.length).toBe(1);
      expect(child.node.props.className).toBe('two');
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

    expect(child.length).toBe(1);
    expect(child.node.props.className).toBe('two');
  });

  it('does not call onChange if descendant input is changed', () => {
    const onChange = expect.createSpy();

    // We need to use mount instead of shallow because we need our simulated change event to
    // bubble to properly test the scenario. Simulated events don't bubble when rendering shallowly.
    const tree = mount(
      <TabList defaultSelectedIndex="0" onChange={ onChange }>
        <div>a <input type="checkbox" /></div>
      </TabList>
    );

    tree.find('input').simulate('change');

    expect(onChange).toNotHaveBeenCalled();
  });
});
