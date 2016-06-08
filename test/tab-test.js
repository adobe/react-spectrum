import React from 'react';
import expect from 'expect';
import Tab from '../components/Tab';
import { shallow, mount } from 'enzyme';

describe.only('Tab', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Tab />);
    expect(tree.prop('className')).toBe('coral-Tab');
    expect(tree.prop('role')).toBe('tab');
    expect(tree.prop('tabIndex')).toBe('0');
    expect(tree.prop('aria-invalid')).toBe(false);
    expect(tree.prop('aria-disabled')).toBe(false);
  });

  it('supports tabIndex', () => {
    const tree = shallow(<Tab tabIndex='10' />);
    expect(tree.prop('tabIndex')).toBe('10');
  });

  it('supports selected', () => {
    const tree = shallow(<Tab selected />);
    expect(tree.prop('className')).toInclude('is-selected');
    expect(tree.prop('aria-selected')).toBe(true);
  });

  it('supports icon', () => {
    const tree = mount(<Tab icon='add' />);
    const child = tree.find('.coral-Icon');
    expect(child.length).toBe(1);
  });

  it('supports disabled', () => {
    const tree = shallow(<Tab disabled />);
    expect(tree.prop('disabled')).toBe(true);
    expect(tree.prop('aria-disabled')).toBe(true);
    expect(tree.prop('className')).toInclude('is-disabled');
  });
});
