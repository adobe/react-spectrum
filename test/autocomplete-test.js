import React from 'react';
import expect from 'expect';
import Autocomplete from '../src/Autocomplete';
import ReactSelect from 'react-select';
import { mount } from 'enzyme';

describe('Select', () => {
  it('supports additional classNames', () => {
    const tree = mount(<Autocomplete className="myClass" />);
    const select = tree.find('div.Select');

    expect(select.prop('className')).toContain('myClass');
    // Check that coral-Autocomplete is not overwritten by the provided class.
    expect(select.prop('className')).toContain('coral-Autocomplete');
  });

  it('supports additional properties', () => {
    const tree = mount(<Autocomplete foo />);
    const reactSelectComponent = tree.find(ReactSelect);

    expect(reactSelectComponent.prop('foo')).toBe(true);
  });
});
