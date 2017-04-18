import React from 'react';
import expect from 'expect';
import {mount} from 'enzyme';
import ReactSelect from 'react-select';
import Select from '../../src/Select';

const testOptions = [
  {label: 'Chocolate', value: 'chocolate'},
  {label: 'Vanilla', value: 'vanilla'},
  {label: 'Strawberry', value: 'strawberry'},
  {label: 'Caramel', value: 'caramel'},
  {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
  {label: 'Coconut', value: 'coco'},
  {label: 'Peppermint', value: 'peppermint'},
  {label: 'Some crazy long value that should be cut off', value: 'logVal'}
];

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

  describe('keypress', () => {
    let setTimeout;
    let clearTimeout;
    let tree;

    const pressKey = (key) => {
      tree.instance().handleKeyPress({key});
      tree.update();
    };

    beforeEach(() => {
      setTimeout = expect.spyOn(window, 'setTimeout').andReturn(3);
      clearTimeout = expect.spyOn(window, 'clearTimeout');
      tree = mount(<Select options={ testOptions } />);
    });

    afterEach(() => {
      setTimeout.restore();
      clearTimeout.restore();
    });

    it('selects the first option on first press', () => {
      pressKey('c');
      expect(tree.state('selectedIndex')).toEqual(0);
    });

    it('selects the next appropriate option on second press', () => {
      pressKey('c');
      pressKey('c');
      expect(tree.state('selectedIndex')).toEqual(3);
    });

    it('wraps on enough presses', () => {
      pressKey('s');
      expect(tree.state('selectedIndex')).toEqual(2);
      pressKey('s');
      expect(tree.state('selectedIndex')).toEqual(6);
      pressKey('s');
      expect(tree.state('selectedIndex')).toEqual(2);
    });

    it('searches on multiple characters', () => {
      pressKey('c');
      pressKey('o');
      expect(tree.state('selectedIndex')).toEqual(4);
    });

    it('ignores invalid searches', () => {
      pressKey('c');
      pressKey('x');
      expect(tree.state('selectedIndex')).toEqual(0);
    });

    it('resets after timeout', () => {
      pressKey('c');
      setTimeout.calls[0].arguments[0]();
      tree.update();
      pressKey('c');
      expect(tree.state('selectedIndex')).toEqual(0);
    });
  });

  it('won\'t submit a parent form when the dropdown button is clicked', () => {
    const submitSpy = expect.createSpy();
    const tree = mount(
      <form onSubmit={ submitSpy }>
        <Select />
      </form>
    );
    tree.find('.coral3-Select-button').get(0).click();
    expect(submitSpy).toNotHaveBeenCalled();
  });

  // This test works locally but not in jenkins
  //
  // it('supports overriding no results text', () => {
  //   const tree = mount(<Select noResultsText="foobar" />);
  //   tree.find('.Select-input').simulate('mousedown');
  //   expect(tree.find('.Select-noresults em').text()).toBe('foobar');
  // });
});
