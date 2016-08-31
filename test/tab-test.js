import React from 'react';
import expect from 'expect';
import { shallow, mount } from 'enzyme';
import Tab from '../src/Tab';

describe('Tab', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Tab />);
    expect(tree.prop('className')).toBe('coral-Tab');
    expect(tree.prop('role')).toBe('tab');
    expect(tree.prop('tabIndex')).toBe('0');
    expect(tree.prop('aria-invalid')).toBe(false);
    expect(tree.prop('aria-disabled')).toBe(false);
  });

  it('supports tabIndex', () => {
    const tree = shallow(<Tab tabIndex="10" />);
    expect(tree.prop('tabIndex')).toBe('10');
  });

  it('supports selected', () => {
    const tree = shallow(<Tab selected />);
    expect(tree.hasClass('is-selected')).toBe(true);
    expect(tree.prop('aria-selected')).toBe(true);
  });

  it('support invalid', () => {
    const tree = shallow(<Tab invalid />);
    expect(tree.hasClass('is-invalid')).toBe(true);
    expect(tree.prop('aria-invalid')).toBe(true);
  });

  it('supports icon', () => {
    const tree = mount(<Tab icon="add" />);
    const child = tree.find('.coral-Icon');
    expect(child.length).toBe(1);
  });

  it('supports disabled', () => {
    const spy = expect.createSpy();
    const tree = shallow(<Tab onClick={ spy } disabled />);
    expect(tree.prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
    expect(tree.hasClass('is-disabled')).toBe(true);
    tree.simulate('click');
    expect(spy).toNotHaveBeenCalled();
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Tab className="foo" />);
    expect(tree.hasClass('foo')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Tab foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
