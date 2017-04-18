import React from 'react';
import expect from 'expect';
import {mount} from 'enzyme';
import ReactSelect from 'react-select';
import Autocomplete from '../../src/Autocomplete';

describe('Autocomplete', () => {
  it('supports additional classNames', () => {
    const tree = mount(<Autocomplete className="myClass" />);
    const select = tree.find('div.Select');

    expect(select.hasClass('myClass')).toBe(true);
    // Check that coral-Autocomplete is not overwritten by the provided class.
    expect(select.hasClass('coral-Autocomplete')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = mount(<Autocomplete foo />);
    const reactSelectComponent = tree.find(ReactSelect);

    expect(reactSelectComponent.prop('foo')).toBe(true);
  });

  it('won\'t submit a parent form when the dropdown arrow button is clicked', () => {
    const submitSpy = expect.createSpy();
    const tree = mount(
      <form onSubmit={ submitSpy }>
        <Autocomplete />
      </form>
    );
    tree.find('.coral-Autocomplete-trigger').get(0).click();
    expect(submitSpy).toNotHaveBeenCalled();
  });

  // This test works locally but not in jenkins.
  //
  // it('supports overriding no results text', () => {
  //   const tree = mount(<Autocomplete noResultsText="foobar" />);
  //   // Mousedown on the arrow button then simulate focus to the text input to open the overlay.
  //   tree.find('.Select-arrow').simulate('mousedown');
  //   tree.find('.Select-input-field').simulate('focus');
  //   expect(tree.find('.Select-noresults em').text()).toBe('foobar');
  // });
});
