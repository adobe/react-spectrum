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
import Breadcrumbs from '../../src/Breadcrumbs';
import FolderIcon from '../../src/Icon/Folder';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Breadcrumbs', function () {
  let tree;
  afterEach(() => {
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });
  it('should render breadcrumbs', function () {
    tree = shallow(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    assert.equal(tree.find('ul').prop('className'), 'spectrum-Breadcrumbs');
    assert.equal(tree.find('.spectrum-Breadcrumbs-item').length, 3);
  });

  it('should support putting an icon at the start', function () {
    tree = shallow(<Breadcrumbs icon={<FolderIcon />} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    assert.equal(tree.childAt(0).type(), FolderIcon);
  });

  it('should support clicking on a breadcrumb', function () {
    const onBreadcrumbClick = sinon.spy();
    tree = shallow(<Breadcrumbs onBreadcrumbClick={onBreadcrumbClick} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    tree.find('.spectrum-Breadcrumbs-item').at(1).find('.spectrum-Breadcrumbs-itemLink').simulate('click');
    assert(onBreadcrumbClick.calledOnce);
    assert.deepEqual(onBreadcrumbClick.lastCall.args[0], {label: 'Bar'});
    assert.deepEqual(onBreadcrumbClick.lastCall.args[1], 1);
  });

  it('clicking on the last breadcrumb should do nothing', function () {
    const onBreadcrumbClick = sinon.spy();
    tree = shallow(<Breadcrumbs onBreadcrumbClick={onBreadcrumbClick} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    tree.find('.spectrum-Breadcrumbs-item').at(2).find('.spectrum-Breadcrumbs-itemLink').simulate('click');
    assert(onBreadcrumbClick.notCalled);
  });

  it('focusing a breadcrumb should display focus-ring style', function () {
    tree = mount(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    let link = tree.find('.spectrum-Breadcrumbs-itemLink').at(0);
    link.simulate('focus', {target: link.getDOMNode()});
    assert(link.getDOMNode().classList.contains('focus-ring'));
  });

  it('on losing focus, a breadcrumb should not display focus-ring style', function () {
    tree = mount(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    let link = tree.find('.spectrum-Breadcrumbs-itemLink').at(0);
    link.simulate('focus', {target: link.getDOMNode()});
    assert(link.getDOMNode().classList.contains('focus-ring'));
    link.simulate('blur', {target: link.getDOMNode()});
    assert(!link.getDOMNode().classList.contains('focus-ring'));
  });

  describe('variant="title"', () => {
    it('last breadcrumb should render with an h1 element when variant="title"', () => {
      const tree = shallow(<Breadcrumbs variant="title" items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
      assert.equal(tree.find('.spectrum-Breadcrumbs-item').at(2).find('h1').length, 1);
      assert(tree.find('.spectrum-Breadcrumbs-item').at(2).find('h1').hasClass('spectrum-Heading--pageTitle'));
      assert.equal(tree.find('.spectrum-Breadcrumbs-item').at(2).find('h1').prop('aria-level'), undefined);
    });

    it('h1 element should include an aria-level attribute when ariaLevel is set', () => {
      tree = shallow(<Breadcrumbs variant="title" ariaLevel="3" items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
      assert.equal(tree.find('.spectrum-Breadcrumbs-item').at(2).find('h1').prop('aria-level'), 3);
    });
  });
});
