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

/** @fileoverview Rating unit tests */

import assert from 'assert';
import FieldLabel from '../../src/FieldLabel';
import {mount, shallow} from 'enzyme';
import Rating from '../../src/Rating';
import React from 'react';
import sinon from 'sinon';

describe('Rating', function () {
  let rating;
  afterEach(() => {
    if (rating) {
      rating.unmount();
      rating = null;
    }
  });
  it('renders a top level div and passes through className', function () {
    rating = shallow(<Rating className="abc" />);
    assert.equal(rating.type(), 'div');
    assert.equal(rating.prop('className'), 'spectrum-Rating abc');
  });

  it('assigns id to input', function () {
    rating = mount(<Rating />);
    assert.equal(rating.find('input').getDOMNode().getAttribute('id'), rating.instance().inputId);
    assert.equal(rating.find('input').getDOMNode(), rating.instance().input);
  });

  it('provides default currentRating and max', function () {
    rating = shallow(<Rating />);
    assert.equal(rating.state('currentRating'), 0);
    assert.equal(rating.instance().props.max, 5);
  });

  it('renders a max number of ratings', function () {
    let max = 10;
    rating = shallow(<Rating max={max} />);
    assert.equal(rating.children('.spectrum-Rating-icon').length, max);
    let input = rating.find('input');
    assert.equal(input.prop('max'), max);
    assert.deepEqual(input.prop('style'), {width: `${24 * max}px`});
    assert.deepEqual(rating.prop('style'), input.prop('style'));
  });

  it('renders a current number of ratings', function () {
    rating = shallow(<Rating max={10} value={5} />);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 5);
    assert.equal(rating.find('input').prop('value'), 5);
  });

  it('supports defaultValue prop', function () {
    rating = shallow(<Rating max={10} defaultValue={5} />);
    assert.equal(rating.state('currentRating'), 5);
    assert.equal(rating.find('.is-selected').length, 5);
    assert.equal(rating.find('input').prop('value'), 5);
    assert.equal(rating.find('input').prop('max'), 10);
  });

  it('supports readOnly prop', function () {
    rating = shallow(<Rating max={10} value={5} readOnly />);
    assert.equal(rating.find('.is-readOnly').length, 11);
  });

  it('sends back the number of stars selected in props.onChange', function () {
    let onChange = sinon.spy();
    rating = shallow(<Rating max={10} onChange={onChange} />);
    rating.find('span').at(1).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [2]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 2);
    assert.equal(rating.find('input').prop('value'), 2);
  });

  it('Provides the ability to disable setting the star functionality', function () {
    let onChange = sinon.spy();
    rating = shallow(<Rating onChange={onChange} disabled />);
    rating.find('span').at(1).simulate('click');
    assert(!onChange.called);
    rating.find('input').simulate('input');
    assert(!onChange.called);
  });

  it('provides a hook to change a rating', function () {
    let spyChange = sinon.spy();
    rating = shallow(<Rating max={10} onChange={spyChange} value={4} />);
    rating.find('span').first().simulate('click', {stopPropagation: function () {}});
    assert(spyChange.called);
    assert.equal(spyChange.lastCall.args[0], 1);
  });

  it('does not update state in controlled mode', function () {
    let spyChange = sinon.spy();
    rating = shallow(<Rating max={10} onChange={spyChange} value={4} />);
    rating.find('span').first().simulate('click', {stopPropagation: function () {}});
    assert(spyChange.called);
    assert.equal(spyChange.lastCall.args[0], 1);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 4);
    assert.equal(rating.find('input').prop('value'), 4);

    rating.setProps({value: 1});
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 1);
    assert.equal(rating.find('input').prop('value'), 1);
  });

  it('does not highlight if disabled', function () {
    rating = shallow(<Rating max={10} value={4} disabled />);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 4);
    assert.equal(rating.find('.is-disabled').length, 11);
    assert.equal(rating.find('input').prop('disabled'), true);
  });

  it('Provides the ability to unset a rating', function () {
    let onChange = sinon.spy();
    rating = shallow(<Rating onChange={onChange} />);
    // Set rating to 1 by clicking first icon
    rating.find('span').at(0).simulate('click', {stopPropagation: function () {}});
    let val = rating.find('input').prop('value');
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [val]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, val);
    assert.equal(val, 1);
    assert.equal(rating.find('input').prop('aria-valuetext'), `${val} star`);

    onChange.resetHistory();

    // Set rating to 0 by clicking first icon with .is-selected
    rating.find('span').at(0).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [val - 1]);
    assert.equal(rating.find('.is-currentValue').length, 0);
    assert.equal(rating.find('.is-selected').length, val - 1);
    assert.equal(rating.find('input').prop('value'), val - 1);
    assert.equal(rating.find('input').prop('aria-valuetext'), `${val - 1} stars`);

    onChange.resetHistory();

    // Set rating to 3 by clicking third icon
    rating.find('span').at(2).simulate('click', {stopPropagation: function () {}});
    val = rating.find('input').prop('value');
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [val]);
    assert.equal(rating.find('.is-selected').length, 3);
    assert.equal(val, 3);

    onChange.resetHistory();

    // Set rating to 2 by clicking first icon with .is-selected
    rating.find('span').at(2).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [val - 1]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, val - 1);
    assert.equal(rating.find('input').prop('value'), val - 1);
    assert.equal(rating.find('input').prop('aria-valuetext'), `${val - 1} stars`);
  });

  it('Clicking on rating icon sets focus to input', function () {
    let onChange = sinon.spy();
    rating = mount(<Rating onChange={onChange} />);
    // Set rating to 1 by clicking first icon
    rating.find('span').at(2).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [3]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 3);
    assert.equal(rating.find('input').prop('value'), 3);
    assert.equal(rating.find('input').prop('aria-valuetext'), `${rating.find('input').prop('value')} stars`);
    assert.equal(rating.find('input').getDOMNode(), document.activeElement);
  });

  it('Permits changing value by adjusting value of input slider', function () {
    let onChange = sinon.spy();
    rating = mount(<Rating onChange={onChange} />);
    // Set rating to 4 by adjusting the input
    rating.find('input').getDOMNode().value = 4;
    rating.find('input').simulate('input', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [4]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 4);
    assert.equal(rating.find('input').prop('value'), 4);
    assert.equal(rating.find('input').prop('aria-valuetext'), `${rating.find('input').prop('value')} stars`);
    assert.equal(rating.find('input').getDOMNode(), document.activeElement);
  });

  it('Keydown on rating icon does nothing', function () {
    let onChange = sinon.spy();
    rating = mount(<Rating onChange={onChange} />);
    rating.find('span').at(2).simulate('keydown', {key: 'ArrowLeft'});
    assert(!onChange.called);
  });

  it('supports aria-label', function () {
    rating = mount(<Rating aria-label="Rating" />);
    assert.equal(rating.find('input').prop('aria-label'), 'Rating');
  });

  it('should use default aria-label, "Star Rating", when no corresponding label is assigned', function () {
    rating = mount(<Rating />);
    assert.equal(rating.find('input').prop('aria-label'), 'Star Rating');
    rating.setProps({'aria-label': 'Rating'});
    assert.equal(rating.find('input').prop('aria-label'), 'Rating');
  });

  it('should favor aria-labelledby over default aria-label when a corresponding label is assigned', () => {
    let labelId = 'label-id';
    rating = mount(<FieldLabel label="Star Rating" id={labelId}><Rating labelId={labelId} /></FieldLabel>);
    assert.equal(rating.find('label').prop('htmlFor'), rating.find('input').prop('id'));
    assert.equal(rating.find('input').prop('aria-label'), null);
    assert.equal(rating.find('input').prop('aria-labelledby'), labelId);
  });

  it('should support custom aria-valuetext and title attributes using valueTextStrings', () => {
    let stub = sinon.stub(console, 'warn');
    const VALUE_TEXT = [
      'No rating',
      '1 Star (Poor)',
      '2 Stars (Fair)',
      '3 Stars (Average)',
      '4 Stars (Good)',
      '5 Stars (Excellent)'
    ];
    rating = mount(
      <Rating defaultValue={0} valueTextStrings={VALUE_TEXT} />
    );
    assert.equal(rating.find('input').prop('aria-valuetext'), VALUE_TEXT[0]);
    VALUE_TEXT.forEach((valueText, i, array) => {
      if (i < array.length - 1) {
        assert.equal(rating.find('span').at(i).prop('title'), VALUE_TEXT[++i]);
      }
    });
    rating.setProps({valueTextStrings: VALUE_TEXT.slice(1)});
    rating.update();
    assert(stub.calledOnce);
    assert(stub.calledWith('valueTextStrings length {5} does not match number of stars including a value for "0" or "none selected" {6}.'));
    stub.restore();
  });

  it('should display focus style', () => {
    let props = {
      onFocus: sinon.spy(),
      onBlur: sinon.spy()
    };
    rating = mount(<Rating {...props} />);
    rating.find('input').getDOMNode().classList.add('focus-ring');
    rating.find('input').simulate('focus', {});
    assert(props.onFocus.calledOnce);
    assert(rating.state('focused'));
    assert(rating.getDOMNode().classList.contains('is-focused'));
    rating.find('input').simulate('blur', {});
    rating.update();
    assert(props.onBlur.calledOnce);
    assert(!rating.state('focused'));
    assert(!rating.getDOMNode().classList.contains('is-focused'));
  });
});
