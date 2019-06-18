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

import ArrowDownSmall from '../../src/Icon/core/ArrowDownSmall';
import assert from 'assert';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import TableCell from '../../src/TableView/js/TableCell';

describe('TableCell', function () {
  it('should render a header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 0);
  });

  it('should render a sortable header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell is-sortable');
    assert.equal(wrapper.prop('aria-sort'), 'none');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 1);
    assert.equal(wrapper.find(ArrowDownSmall).prop('className'), 'spectrum-Table-sortedIcon');
  });

  it('should render a sorted desc header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}} sortDir={1}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell is-sortable is-sorted-desc');
    assert.equal(wrapper.prop('aria-sort'), 'descending');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 1);
    assert.equal(wrapper.find(ArrowDownSmall).prop('className'), 'spectrum-Table-sortedIcon');
  });

  it('should render a sorted asc header cell', function () {
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}} sortDir={-1}>test</TableCell>);
    assert.equal(wrapper.prop('className'), 'spectrum-Table-headCell is-sortable is-sorted-asc');
    assert.equal(wrapper.prop('aria-sort'), 'ascending');
    assert.equal(wrapper.childAt(0).text(), 'test');
    assert.equal(wrapper.find(ArrowDownSmall).length, 1);
    assert.equal(wrapper.find(ArrowDownSmall).prop('className'), 'spectrum-Table-sortedIcon');
  });

  it('should call onClick event on Enter or Space keypress', function () {
    let onClick = sinon.spy();
    let wrapper = shallow(<TableCell isHeaderRow column={{sortable: true}} onClick={onClick}>test</TableCell>);
    assert.equal(wrapper.prop('tabIndex'), 0);
    wrapper.setProps({'allowsMultipleSelection': true});
    assert.equal(wrapper.prop('tabIndex'), -1);
    wrapper.simulate('keyPress', {key: 'ArrowDown', preventDefault: () => {}});
    assert(!onClick.calledOnce);
    wrapper.simulate('keyPress', {key: ' ', preventDefault: () => {}});
    assert(onClick.calledOnce);
    wrapper.simulate('keyPress', {key: 'Enter', preventDefault: () => {}});
    assert(onClick.calledTwice);
    wrapper.setProps({onClick: null});
    wrapper.simulate('keyPress', {key: 'Enter', preventDefault: () => {}});
    assert(!onClick.calledThrice);
  });

  it('should render a body cell', function () {
    let wrapper = shallow(<TableCell>test</TableCell>);
    assert(wrapper.hasClass('spectrum-Table-cell'));
    assert(wrapper.hasClass('react-spectrum-Table-cell'));
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should render a body cell with a divider', function () {
    let wrapper = shallow(<TableCell column={{divider: true}}>test</TableCell>);
    assert(wrapper.hasClass('spectrum-Table-cell'));
    assert(wrapper.hasClass('react-spectrum-Table-cell'));
    assert(wrapper.hasClass('spectrum-Table-cell--divider'));
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should render a body cell aligned center', function () {
    let wrapper = shallow(<TableCell column={{align: 'center'}}>test</TableCell>);
    assert(wrapper.hasClass('spectrum-Table-cell'));
    assert(wrapper.hasClass('react-spectrum-Table-cell'));
    assert(wrapper.hasClass('spectrum-Table-cell--alignCenter'));
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should render a body cell aligned right', function () {
    let wrapper = shallow(<TableCell column={{align: 'right'}}>test</TableCell>);
    assert(wrapper.hasClass('spectrum-Table-cell'));
    assert(wrapper.hasClass('react-spectrum-Table-cell'));
    assert(wrapper.hasClass('spectrum-Table-cell--alignRight'));
    assert.equal(wrapper.childAt(0).text(), 'test');
  });

  it('should set a static width on a cell', function () {
    let wrapper = shallow(<TableCell column={{width: 100}}>test</TableCell>);
    let style = wrapper.prop('style');
    assert.equal(style.width, 100);
    assert.equal(style.flexShrink, 0);
  });

  it('should set a static minimum width on a cell', function () {
    let wrapper = shallow(<TableCell column={{minWidth: 100}}>test</TableCell>);
    let style = wrapper.prop('style');
    assert.equal(style.minWidth, 100);
    assert.equal(style.flexGrow, 1);
  });

  it('should set a static maximum width on a cell', function () {
    let wrapper = shallow(<TableCell column={{maxWidth: 100}}>test</TableCell>);
    let style = wrapper.prop('style');
    assert.equal(style.maxWidth, 100);
    assert.equal(style.flexGrow, 1);
  });

  it('should pass through a custom class name', function () {
    let wrapper = shallow(<TableCell className="test">test</TableCell>);
    assert(wrapper.hasClass('spectrum-Table-cell'));
    assert(wrapper.hasClass('react-spectrum-Table-cell'));
    assert(wrapper.hasClass('test'));
  });

  it('onFocus/onBlur keeps track of whether a child has focus.', () => {
    let wrapper = mount(<TableCell tabIndex={-1}><input type="checkbox" /></TableCell>);
    wrapper.simulate('focus', {
      target: wrapper.getDOMNode(),
      nativeEvent: {
        stopImmediatePropagation: () => {}
      }
    });
    assert.equal(wrapper.find('input').getDOMNode(), document.activeElement);
    wrapper.simulate('focus', {
      target: wrapper.find('input').getDOMNode(),
      nativeEvent: {
        stopImmediatePropagation: () => {}
      }
    });
    assert(wrapper.state('childFocused'));
    document.activeElement.blur();
    wrapper.simulate('blur', {target: wrapper.find('input').getDOMNode()});
    assert(!wrapper.state('childFocused'));
    wrapper.unmount();
  });
});
