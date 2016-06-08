import React from 'react';
import expect, { createSpy } from 'expect';
import TabList from '../components/TabList';
import { shallow } from 'enzyme';

describe('TabList', () => {
  it('has correct defaults', () => {
    const tree = shallow(<TabList />);
    expect(tree.prop('className')).toBe('coral-TabList');
    expect(tree.type()).toBe('div');
    expect(tree.prop('role')).toBe('tablist');
    expect(tree.prop('aria-multiselectable')).toBe(false);
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
      <TabList onChange={spy}>
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
    );


    const child = tree.find('.two');
    child.simulate('click');

    expect(spy).toHaveBeenCalledWith('1');
  });

  it('support custom keys property', () => {
    const spy = createSpy();
    const tree = shallow(
      <TabList onChange={spy}>
        <div key="one" className="one">a</div>
        <div key="two" className="two">b</div>
      </TabList>
    );

    const child = tree.find('.two');
    child.simulate('click');

    expect(spy).toHaveBeenCalledWith('two');
  });

  it('supports selectedKey', () => {
    const tree = shallow(
      <TabList selectedKey="1">
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
    );
    const child = tree.find('[selected=true]');

    expect(child.length).toBe(1);
    expect(child.node.props.className).toBe('two');
  });

  it('supports defaultSelectedKey', () => {
    const tree = shallow(
      <TabList selectedKey="1">
        <div className="one">a</div>
        <div className="two">b</div>
      </TabList>
    );
    const child = tree.find('[selected=true]');

    expect(child.length).toBe(1);
    expect(child.node.props.className).toBe('two');
  });
});
