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
import {mount, shallow} from 'enzyme';
import Rating from '../../src/Rating';
import React from 'react';
import sinon from 'sinon';

describe('Rating', function () {
  it('renders a top level div and passes through className', function () {
    var rating = shallow(<Rating className="abc" />);
    assert.equal(rating.type(), 'div');
    assert.equal(rating.prop('className'), 'spectrum-Rating abc');
  });

  it('assigns id to input', function () {
    var rating = mount(<Rating />);
    assert.equal(rating.find('input').getDOMNode().getAttribute('id'), rating.instance().inputId);
    assert.equal(rating.find('input').getDOMNode(), rating.instance().input);

    rating.unmount();
  });

  it('provides default currentRating and max', function () {
    var rating = shallow(<Rating />);
    assert.equal(rating.state('currentRating'), 0);
    assert.equal(rating.instance().props.max, 5);
  });

  it('renders a max number of ratings', function () {
    var rating = shallow(<Rating max={10} />);
    assert.equal(rating.children('.spectrum-Rating-icon').length, 10);
    assert.equal(rating.find('input').prop('max'), 10);
  });

  it('renders a current number of ratings', function () {
    var rating = shallow(<Rating max={10} value={5} />);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 5);
    assert.equal(rating.find('input').prop('value'), 5);
  });

  it('sends back the number of stars selected in props.onChange', function () {
    var onChange = sinon.spy();
    var rating = shallow(<Rating max={10} onChange={onChange} />);
    rating.find('span').at(1).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [2]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 2);
    assert.equal(rating.find('input').prop('value'), 2);
  });

  it('Provides the ability to disable setting the star functionality', function () {
    var onChange = sinon.spy();
    var rating = shallow(<Rating onChange={onChange} disabled />);
    rating.find('span').at(1).simulate('click');
    assert(!onChange.called);
    rating.find('input').simulate('input');
    assert(!onChange.called);
  });

  it('provides a hook to change a rating', function () {
    var spyChange = sinon.spy();
    var rating = shallow(<Rating max={10} onChange={spyChange} value={4} />);
    rating.find('span').first().simulate('click', {stopPropagation: function () {}});
    assert(spyChange.called);
    assert.equal(spyChange.lastCall.args[0], 1);
  });

  it('does not update state in controlled mode', function () {
    var spyChange = sinon.spy();
    var rating = shallow(<Rating max={10} onChange={spyChange} value={4} />);
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
    var rating = shallow(<Rating max={10} value={4} disabled />);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 4);
    assert.equal(rating.find('.is-disabled').length, 11);
    assert.equal(rating.find('input').prop('disabled'), true);
  });

  it('Provides the ability to set rating to 0', function () {
    var onChange = sinon.spy();
    var rating = shallow(<Rating onChange={onChange} />);
    // Set rating to 1 by clicking first icon
    rating.find('span').at(0).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [1]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 1);
    assert.equal(rating.find('input').prop('value'), 1);

    // Set rating to 0 by clicking first icon with .is-selected
    rating.find('span').at(0).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledTwice);
    assert.deepEqual(onChange.getCall(1).args, [0]);
    assert.equal(rating.find('.is-currentValue').length, 0);
    assert.equal(rating.find('.is-selected').length, 0);
    assert.equal(rating.find('input').prop('value'), 0);
  });

  it('Clicking on rating icon sets focus to input', function () {
    var onChange = sinon.spy();
    var rating = mount(<Rating onChange={onChange} />);
    // Set rating to 1 by clicking first icon
    rating.find('span').at(2).simulate('click', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [3]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 3);
    assert.equal(rating.find('input').prop('value'), 3);
    assert.equal(rating.find('input').getDOMNode(), document.activeElement);

    rating.unmount();
  });

  it('Permits changing value by adjusting value of input slider', function () {
    var onChange = sinon.spy();
    var rating = mount(<Rating onChange={onChange} />);
    // Set rating to 4 by adjusting the input
    rating.find('input').getDOMNode().value = 4;
    rating.find('input').simulate('input', {stopPropagation: function () {}});
    assert(onChange.calledOnce);
    assert.deepEqual(onChange.getCall(0).args, [4]);
    assert.equal(rating.find('.is-currentValue').length, 1);
    assert.equal(rating.find('.is-selected').length, 4);
    assert.equal(rating.find('input').prop('value'), 4);
    assert.equal(rating.find('input').getDOMNode(), document.activeElement);

    rating.unmount();
  });

  it('Keydown on rating icon does nothing', function () {
    var onChange = sinon.spy();
    var rating = mount(<Rating onChange={onChange} />);
    rating.find('span').at(2).simulate('keydown', {key: 'ArrowLeft'});
    assert(!onChange.called);

    rating.unmount();
  });
});
