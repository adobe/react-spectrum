/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import assert from 'assert';
import Autocomplete from '../../src/Autocomplete';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import {Tag, TagList} from '../../src/TagList';
import TagField from '../../src/TagField';
import Textfield from '../../src/Textfield';

describe('TagField', () => {
  it('should render a textfield when empty', () => {
    const tree = shallow(<TagField />);
    let autoComplete = tree.find(Autocomplete);
    assert.equal(tree.type(), Autocomplete);
    assert.equal(tree.prop('className'), 'react-spectrum-TagField spectrum-Textfield');

    assert.equal(tree.find(Textfield).length, 1);
    assert.equal(tree.find(Textfield).prop('autocompleteInput'), true);
    assert.equal(autoComplete.prop('allowCreate'), true);
    assert.equal(tree.find(TagList).prop('values').length, 0);
  });

  it('should render classnames for states', () => {
    const tree = shallow(<TagField quiet disabled invalid />);
    assert.equal(tree.prop('className'), 'react-spectrum-TagField spectrum-Textfield spectrum-Textfield--quiet react-spectrum-TagField--quiet is-disabled is-invalid');
  });

  it('should render tags when a value is given', () => {
    const tree = shallow(<TagField value={[{label: 'one'}, {label: 'two'}]} />);
    assert.equal(tree.find(TagList).prop('values').length, 2);
  });

  it('should allow entering tags', () => {
    const onChange = sinon.spy();
    const tree = shallow(<TagField onChange={onChange} />);

    tree.simulate('change', 'test');
    assert.equal(tree.prop('value'), 'test');

    // Add one
    tree.simulate('select', 'foo');
    assert.equal(tree.prop('value'), '');

    let values = tree.find(TagList).prop('values');
    assert.equal(values.length, 1);
    assert.equal(values[0], 'foo');

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], ['foo']);

    // Add another
    tree.simulate('select', 'hi');
    assert.equal(tree.prop('value'), '');

    values = tree.find(TagList).prop('values');
    assert.equal(values.length, 2);
    assert.equal(values[0], 'foo');
    assert.equal(values[1], 'hi');

    assert.equal(onChange.callCount, 2);
    assert.deepEqual(onChange.getCall(1).args[0], ['foo', 'hi']);
  });
  it('should allow check if the option is string or array of object tags', () => {
    const onChange = sinon.spy();
    const OBJECT_OPTIONS = [
        {label: 'Chocolate', id: '1'},
        {label: 'Vanilla', id: '2'},
        {label: 'Strawberry', id: '3'}

    ];
    let text = 'ta';
    const tree = shallow(<TagField onChange={onChange} getCompletions={OBJECT_OPTIONS.filter(o => o.label.toLowerCase().startsWith(text.toLowerCase()))} />);

    tree.simulate('change', 'test');
    assert.equal(tree.prop('value'), 'test');

    // Add one
    tree.simulate('select', 'Chocolate');
    assert.equal(tree.prop('value'), '');

    let values = tree.find(TagList).prop('values');
    assert.equal(values.length, 1);
    assert.equal(values[0], 'Chocolate');

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], ['Chocolate']);

  });
  it('should not allow empty tags', () => {
    const tree = shallow(<TagField />);

    tree.simulate('select', '');
    assert.equal(tree.find(TagList).prop('values').length, 0);
  });

  it('should set allowCreate prop to false in Autocomplete', () => {
    const tree = shallow(<TagField allowCreate={false} />);
    let autoComplete = tree.find(Autocomplete);
    assert.equal(autoComplete.prop('allowCreate'), false);
  });

  it('should allow tags creation by default', () => {
    const tree = shallow(<TagField />);

    tree.simulate('change', 'foo');
    assert.equal(tree.prop('value'), 'foo');
  });

  it('should not allow duplicates by default', () => {
    const tree = shallow(<TagField />);

    tree.simulate('select', 'foo');
    tree.simulate('select', 'foo');

    assert.equal(tree.find(TagList).prop('values').length, 1);
  });

  it('should allow duplicates with allowDuplicates prop', () => {
    const tree = shallow(<TagField allowDuplicates />);

    tree.simulate('select', 'foo');
    tree.simulate('select', 'foo');

    assert.equal(tree.find(TagList).prop('values').length, 2);
  });

  it('should allow removing tags', () => {
    const onChange = sinon.spy();
    const tree = shallow(<TagField onChange={onChange} />);

    tree.simulate('select', 'foo');
    assert.equal(tree.find(TagList).prop('values').length, 1);

    assert.equal(onChange.callCount, 1);
    assert.deepEqual(onChange.getCall(0).args[0], ['foo']);

    tree.find(TagList).simulate('close', 'foo');
    assert.equal(tree.find(TagList).prop('values').length, 0);

    assert.equal(onChange.callCount, 2);
    assert.deepEqual(onChange.getCall(1).args[0], []);
  });

  it('should not set state in controlled mode', () => {
    const tree = shallow(<TagField value={['one']} />);

    assert.equal(tree.find(TagList).prop('values').length, 1);

    tree.simulate('change', 'test');
    // prop should not change as controlled
    assert.deepEqual(tree.find(TagList).prop('values'), ['one']);

    // Add one
    tree.simulate('select', 'two');
    assert.deepEqual(tree.find(TagList).prop('values'), ['one']);

    // Doesn't add until prop change
    assert.equal(tree.find(TagList).prop('values').length, 1);

    tree.setProps({value: ['one', 'two']});
    assert.equal(tree.find(TagList).prop('values').length, 2);
  });
  it('focus should not be lost when deleting the last indexed value', async () => {
    const onChange = sinon.spy();
    const tree = mount(<TagField onChange={onChange} />);
    tree.setState({tags: ['foo', 'hi']});
    tree.update();
    // remove the last item from the tagList
    tree.find('button').last().simulate('click');

    assert.equal(tree.find(TagList).prop('values').length, 1);
    // There should be 1 tag left and it should have focus
    assert.equal(tree.find('.spectrum-Tags-item').getDOMNode(), document.activeElement);

    // remove the final item from the tagList
    tree.find('button').last().simulate('click');
    assert.equal(tree.find(TagList).prop('values').length, 0);
    // There should be 0 tags left. The textfield should have focus
    assert.equal(tree.find('input.react-spectrum-TagField-input').getDOMNode(), document.activeElement);
    tree.unmount();

  });
  it('focus should not be lost when removing the last indexed value when controlled', async () => {

    const tree = mount(<TagField value={['one', 'two']} placeholder="Tags" />);
    // Place focus on the last tag
    tree.find('.spectrum-Tags-item').last().getDOMNode().focus();
    // Update the component such that the 2nd tag is deleted.
    tree.setProps({value: ['one']});
    // Check focus is now on the only remaining tag
    assert.equal(tree.find('.spectrum-Tags-item').getDOMNode(), document.activeElement);
    // remove the final item from the tagList
    tree.setProps({value: []});
    // There should be 0 tags left. The textfield should have focus
    assert.equal(tree.find('input.react-spectrum-TagField-input').getDOMNode(), document.activeElement);
    tree.unmount();

  });
  it('should not show placeholder text if there is one or more tags', () => {
    const tree = shallow(<TagField placeholder="this is bat country" />);
    assert.equal(tree.find(Textfield).prop('placeholder'), 'this is bat country');

    // Add a tag, ensure no placeholder exists.
    tree.simulate('select', 'foo');
    assert.equal(tree.find(Textfield).prop('placeholder'), '');

    // Remove the tag, make sure placeholder is back.
    tree.find(TagList).simulate('close', 'foo');
    assert.equal(tree.find(Textfield).prop('placeholder'), 'this is bat country');
  });
  it('should pass renderItem prop to Autocomplete', async () => {
    const renderItem = item => <em>{item}</em>;
    const tree = mount(<TagField getCompletions={() => []} renderItem={renderItem} />);

    assert.equal(tree.find(Autocomplete).prop('renderItem'), renderItem);
  });
  it('should allow custom tag rendering', () => {
    let renderTag = (tag) => <Tag>{tag.label + tag.meta}</Tag>;
    const tree = mount(<TagField value={[{label: 'one', meta: '1'}]} renderTag={renderTag} />);

    assert.equal(tree.find('.spectrum-Tags-itemLabel').text(), 'one1');
  });
});

