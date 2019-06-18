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
import Asterisk from '../../src/Icon/Asterisk';
import FieldLabel from '../../src/FieldLabel';
import React from 'react';
import {shallow} from 'enzyme';
import Textfield from '../../src/Textfield';

const render = (props = {}) => shallow(
  <FieldLabel label="foo" {...props}>
    <Textfield value="test" />
  </FieldLabel>
).dive();

describe('FieldLabel', () => {
  it('should render a label and its children', () => {
    const tree = render();

    assert.equal(tree.find('label').text(), 'foo');
    assert.equal(tree.find(Textfield).length, 1);
    assert.equal(tree.find(Textfield).prop('value'), 'test');
  });

  it('should render only a label', () => {
    const tree = shallow(<FieldLabel label="foo" labelFor="foo" className="test" />).dive();
    assert.equal(tree.type(), 'label');
    assert.equal(tree.text(), 'foo');
    assert.equal(tree.prop('className'), 'spectrum-FieldLabel test');
  });

  it('should generate an id and label for attribute by default', () => {
    const tree = render();
    assert(tree.find('label').prop('htmlFor'));
    assert.equal(tree.find('label').prop('htmlFor'), tree.find('Textfield').prop('id'));
  });

  it('if an id is specified on the label it should remain unchanged', () => {
    const tree = shallow(<FieldLabel label="foo" id="bar" />).dive();
    assert.equal(tree.find('label').prop('id'), 'bar');
  });

  it('if an id is not specified on the label one should be generated', () => {
    const tree = shallow(<FieldLabel label="foo" />).dive();
    assert(tree.find('label').prop('id'));
  });

  it('should render a label positioned on the left side', () => {
    const tree = render({position: 'left'});

    assert.equal(tree.find('label').hasClass('spectrum-FieldLabel spectrum-FieldLabel--left'), true);
  });

  it('should render a label positioned on the right side', () => {
    const tree = render({position: 'right'});

    assert.equal(tree.find('label').hasClass('spectrum-FieldLabel spectrum-FieldLabel--right'), true);
  });

  it('supports label for', () => {
    const tree = render({labelFor: 'bar'});

    assert.equal(tree.find('label').prop('htmlFor'), 'bar');
  });

  it('supports necessity required', () => {
    const tree = render({necessity: 'required'});
    assert.equal(tree.find('label').text(), 'foo <Asterisk />');
    assert.equal(tree.find(Asterisk).length, 1);
  });

  it('supports necessity required and necessityIndicator icon', () => {
    const tree = render({necessity: 'required', necessityIndicator: 'icon'});
    assert.equal(tree.find('label').text(), 'foo <Asterisk />');
    assert.equal(tree.find(Asterisk).length, 1);
  });

  it('supports necessity required necessityIndicator label', () => {
    const tree = render({necessity: 'required', necessityIndicator: 'label'});
    assert.equal(tree.find('label').text(), 'foo (required)');
    assert.equal(tree.find(Asterisk).length, 0);
  });

  it('supports necessity optional', () => {
    const tree = render({necessity: 'optional'});
    assert.equal(tree.find('label').text(), 'foo');
    assert.equal(tree.find(Asterisk).length, 0);
  });

  it('supports necessity optional necessityIndicator label', () => {
    const tree = render({necessity: 'optional', necessityIndicator: 'label'});
    assert.equal(tree.find('label').text(), 'foo (optional)');
    assert.equal(tree.find(Asterisk).length, 0);
  });

  it('supports additional classNames', () => {
    const tree = render({className: 'myClass'});

    assert.equal(tree.hasClass('myClass'), true);
  });

  it('supports additional properties', () => {
    const tree = render({id: 'email'});

    assert.equal(tree.find('label').prop('id'), 'email');
  });
});
