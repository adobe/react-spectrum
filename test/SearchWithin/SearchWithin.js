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
import React from 'react';
import Search from '../../src/Search';
import SearchWithin from '../../src/SearchWithin';
import {shallow} from 'enzyme';

const testOptions = [
  {label: 'Chocolate', value: 'chocolate'},
  {label: 'Vanilla', value: 'vanilla'},
  'Strawberry',
  {label: 'Caramel', value: 'caramel'},
  {label: 'Cookies and Cream', value: 'cookiescream', disabled: true},
  {label: 'Coconut', value: 'coco'},
  {label: 'Peppermint', value: 'peppermint'},
  {label: 'Some crazy long value that should be cut off', value: 'logVal'}
];

describe('Search Within', () => {
  it('default', () => {
    const tree = shallow(<SearchWithin scopeOptions={testOptions} />);
    assert.equal(tree.hasClass('spectrum-SearchWithin'), true);
    assert.equal(tree.prop('role'), 'search');
    assert.equal(tree.prop('aria-label'), 'Search within');

    assert.equal(findSelect(tree).prop('aria-labelledby'), tree.prop('id'));
    assert.equal(findSearch(tree).prop('aria-labelledby'), findSelect(tree).prop('id'));
  });

  it('supports value with empty string', () => {
    const tree = shallow(<SearchWithin value="" defaultValue="default" scopeOptions={testOptions} />);
    assert.equal(tree.find(Search).props().value, '');
  });

  it('supports labelling using aria-label', () => {
    const tree = shallow(<SearchWithin scopeOptions={testOptions} aria-label="This is a label" />);
    assert.equal(tree.prop('aria-label'), 'This is a label');
    assert.equal(findSelect(tree).prop('aria-labelledby'), tree.prop('id'));
    assert.equal(findSearch(tree).prop('aria-labelledby'), findSelect(tree).prop('id'));
  });
  it('supports labelling using aria-labelledby alone', () => {
    const tree = shallow(<SearchWithin scopeOptions={testOptions} aria-labelledby="foo" />);
    assert.equal(tree.prop('aria-labelledby'), 'foo');
    assert.equal(findSelect(tree).prop('aria-labelledby'), 'foo');
    assert.equal(findSearch(tree).prop('aria-labelledby'), findSelect(tree).prop('id'));
  });
  it('supports labelling using both aria-labelledby and aria-label', () => {
    const tree = shallow(<SearchWithin scopeOptions={testOptions} aria-label="This is a label" aria-labelledby="foo" />);
    assert.equal(tree.prop('aria-labelledby'), 'foo ' + tree.prop('id'));
    assert.equal(findSelect(tree).prop('aria-labelledby'), 'foo ' + tree.prop('id'));
    assert.equal(findSearch(tree).prop('aria-labelledby'), findSelect(tree).prop('id'));
  });
});

const findSelect = tree => tree.find('Select');
const findSearch = tree => tree.find('Search');
