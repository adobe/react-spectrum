import React from 'react';
import expect from 'expect';
import Select from '../src/Select';
import ReactSelect from 'react-select';
import { mount } from 'enzyme';

describe('Select', () => {
  it('supports additional classNames', () => {
    const tree = mount(<Select className="myClass" />);
    const select = tree.find('div.Select');

    expect(select.prop('className')).toContain('myClass');
    // Check that coral3-Select is not overwritten by the provided class.
    expect(select.prop('className')).toContain('coral3-Select');
  });

  it('supports additional properties', () => {
    const tree = mount(<Select foo />);
    const reactSelectComponent = tree.find(ReactSelect);

    expect(reactSelectComponent.prop('foo')).toBe(true);
  });
});
