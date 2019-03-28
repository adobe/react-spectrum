import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import {ShellOrgSwitcher} from '../../src/Shell';

const render = (props = {}) => {
  const defaultProps = {
    value: 'foo',
    options: [
      {value: 'foo', label: 'Foo'},
      {value: 'bar', label: 'Bar'},
      {value: 'baz', label: 'Baz'}
    ]
  };

  return <ShellOrgSwitcher {...defaultProps} {...props} />;
};

const findNoResultsContainer = (tree) => tree.find('.coral3-Shell-orgSwitcher-resultMessage');
const findSelectList = (tree) => tree.find('SelectList');
const findTargetButton = (tree) => tree.prop('target');

describe('ShellOrgSwitcher', () => {
  let tree;

  describe('toggles between "no organizations found" and SelectList', () => {
    let noResultsContainer;
    let selectList;

    beforeEach(() => {
      tree = shallow(render());
    });

    const changeSearchTerm = (searchTerm) => {
      tree.instance().handleSearchChange(searchTerm);
      tree.update();
      noResultsContainer = findNoResultsContainer(tree);
      selectList = findSelectList(tree);
    };

    it('displays "no organizations found" if searchTerm doesn\'t match any options', () => {
      changeSearchTerm('string-that-doesn\'t-match');
      assert.equal(noResultsContainer.exists(), true);
      assert.equal(selectList.exists(), false);
    });

    it('displays SelectList if searchTerm matches options', () => {
      changeSearchTerm('foo');
      assert.equal(noResultsContainer.exists(), false);
      assert.equal(selectList.exists(), true);
    });
  });

  describe('value displayed in Button', () => {
    const getTargetButtonContent = (tree) => findTargetButton(tree).props['children'];

    it('displays the label for the selected value', () => {
      tree = shallow(render({value: 'foo'}));
      assert.equal(getTargetButtonContent(tree), 'Foo');
    });

    it('displays the value if the option doesn\'t exist', () => {
      tree = shallow(render({value: 'value-doesn\'t-match-options'}));
      assert.equal(getTargetButtonContent(tree), 'value-doesn\'t-match-options');
    });

    it('displays empty string is value isn\'t set', () => {
      tree = shallow(render({value: undefined}));
      assert.equal(getTargetButtonContent(tree), '');
    });
  });

});
