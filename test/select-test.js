import React from 'react';
import expect from 'expect';
import Select from '../src/Select';
import ReactSelect from 'react-select';
import { mount } from 'enzyme';

describe('Select', () => {
  it('supports additional classNames', () => {
    const tree = mount(<Select className="myClass" />);
    const select = tree.find('div.Select');

    expect(select.hasClass('myClass')).toBe(true);
    // Check that coral3-Select is not overwritten by the provided class.
    expect(select.hasClass('coral3-Select')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = mount(<Select foo />);
    const reactSelectComponent = tree.find(ReactSelect);

    expect(reactSelectComponent.prop('foo')).toBe(true);
  });

  it('supports overriding no results text', () => {
    const tree = mount(<Select noResultsText="foobar" />);
    tree.find('.Select-input').simulate('mousedown');
    expect(tree.find('.Select-noresults em').text()).toBe('foobar');
  });
});
