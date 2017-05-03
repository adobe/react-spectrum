import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import expect from 'expect';
import React from 'react';
import {shallow} from 'enzyme';
import {Tag} from '../../src/TagList';
import TagField from '../../src/TagField';
import Textfield from '../../src/Textfield';

describe('TagField', () => {
  it('should render a textfield when empty', () => {
    const tree = shallow(<TagField />);
    assert.equal(tree.type(), Autocomplete);
    assert.equal(tree.prop('className'), 'coral-TagField');

    assert.equal(tree.find(Textfield).length, 1);
    assert.equal(tree.find(Textfield).prop('autocompleteInput'), true);
    assert.equal(tree.find(Tag).length, 0);
  });

  it('should render classnames for states', () => {
    const tree = shallow(<TagField quiet disabled invalid />);
    assert.equal(tree.prop('className'), 'coral-TagField coral-TagField--quiet is-disabled is-invalid');
  });

  it('should render tags when a value is given', () => {
    const tree = shallow(<TagField value={['one', 'two']} />);
    assert.equal(tree.find(Tag).length, 2);
    assert.equal(tree.find(Tag).first().prop('closable'), true);
    assert.equal(tree.find(Tag).first().prop('size'), 'S');
    assert.equal(tree.find(Tag).first().childAt(0).text(), 'one');
  });

  it('should allow entering tags', () => {
    const onChange = expect.createSpy();
    const tree = shallow(<TagField onChange={onChange} />);

    tree.simulate('change', 'test');
    assert.equal(tree.prop('value'), 'test');

    // Add one
    tree.simulate('select', 'foo');
    assert.equal(tree.prop('value'), '');

    assert.equal(tree.find(Tag).length, 1);
    assert.equal(tree.find(Tag).first().childAt(0).text(), 'foo');

    assert.equal(onChange.calls.length, 1);
    assert.deepEqual(onChange.calls[0].arguments[0], ['foo']);

    // Add another
    tree.simulate('select', 'hi');
    assert.equal(tree.prop('value'), '');

    assert.equal(tree.find(Tag).length, 2);
    assert.equal(tree.find(Tag).first().childAt(0).text(), 'foo');
    assert.equal(tree.find(Tag).last().childAt(0).text(), 'hi');

    assert.equal(onChange.calls.length, 2);
    assert.deepEqual(onChange.calls[1].arguments[0], ['foo', 'hi']);
  });

  it('should not allow empty tags', () => {
    const tree = shallow(<TagField />);

    tree.simulate('select', '');
    assert.equal(tree.find(Tag).length, 0);
  });

  it('should not allow duplicates by default', () => {
    const tree = shallow(<TagField />);

    tree.simulate('select', 'foo');
    tree.simulate('select', 'foo');

    assert.equal(tree.find(Tag).length, 1);
  });

  it('should allow duplicates with allowDuplicates prop', () => {
    const tree = shallow(<TagField allowDuplicates />);

    tree.simulate('select', 'foo');
    tree.simulate('select', 'foo');

    assert.equal(tree.find(Tag).length, 2);
  });

  it('should allow removing tags', () => {
    const onChange = expect.createSpy();
    const tree = shallow(<TagField onChange={onChange} />);

    tree.simulate('select', 'foo');
    assert.equal(tree.find(Tag).length, 1);

    assert.equal(onChange.calls.length, 1);
    assert.deepEqual(onChange.calls[0].arguments[0], ['foo']);

    tree.find(Tag).simulate('close', 'foo');
    assert.equal(tree.find(Tag).length, 0);

    assert.equal(onChange.calls.length, 2);
    assert.deepEqual(onChange.calls[1].arguments[0], []);
  });

  it('should not set state in controlled mode', () => {
    const tree = shallow(<TagField value={['one']} />);

    assert.equal(tree.find(Tag).length, 1);

    tree.simulate('change', 'test');
    assert.equal(tree.prop('value'), 'test');

    // Add one
    tree.simulate('select', 'two');
    assert.equal(tree.prop('value'), '');

    // Doesn't add until prop change
    assert.equal(tree.find(Tag).length, 1);

    tree.setProps({value: ['one', 'two']});
    assert.equal(tree.find(Tag).length, 2);
  });
});
