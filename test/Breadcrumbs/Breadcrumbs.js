import assert from 'assert';
import Breadcrumbs from '../../src/Breadcrumbs';
import FolderIcon from '../../src/Icon/Folder';
import {mount, shallow} from 'enzyme';
import React from 'react';
import sinon from 'sinon';

describe('Breadcrumbs', function () {
  it('should render breadcrumbs', function () {
    const tree = shallow(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    assert.equal(tree.find('ul').prop('className'), 'spectrum-Breadcrumbs');
    assert.equal(tree.find('.spectrum-Breadcrumb').length, 3);
  });

  it('should support putting an icon at the start', function () {
    const tree = shallow(<Breadcrumbs icon={<FolderIcon />} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    assert.equal(tree.childAt(0).type(), FolderIcon);
  });

  it('should support clicking on a breadcrumb', function () {
    const onBreadcrumbClick = sinon.spy();
    const tree = shallow(<Breadcrumbs onBreadcrumbClick={onBreadcrumbClick} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    tree.find('.spectrum-Breadcrumb').at(1).find('.spectrum-Breadcrumb-link').simulate('click');
    assert(onBreadcrumbClick.calledOnce);
    assert.deepEqual(onBreadcrumbClick.lastCall.args[0], {label: 'Bar'});
    assert.deepEqual(onBreadcrumbClick.lastCall.args[1], 1);
  });

  it('clicking on the last breadcrumb should do nothing', function () {
    const onBreadcrumbClick = sinon.spy();
    const tree = shallow(<Breadcrumbs onBreadcrumbClick={onBreadcrumbClick} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    tree.find('.spectrum-Breadcrumb').at(2).find('.spectrum-Breadcrumb-link').simulate('click');
    assert(onBreadcrumbClick.notCalled);
  });

  it('focusing a breadcrumb should display focus-ring style', function () {
    const tree = mount(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    let link = tree.find('.spectrum-Breadcrumb-link').at(0);
    link.simulate('focus', {target: link.getDOMNode()});
    assert(link.getDOMNode().classList.contains('focus-ring'));
  });

  it('on losing focus, a breadcrumb should not display focus-ring style', function () {
    const tree = mount(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    let link = tree.find('.spectrum-Breadcrumb-link').at(0);
    link.simulate('focus', {target: link.getDOMNode()});
    assert(link.getDOMNode().classList.contains('focus-ring'));
    link.simulate('blur', {target: link.getDOMNode()});
    assert(!link.getDOMNode().classList.contains('focus-ring'));
  });

  describe('variant="title"', () => {
    it('last breadcrumb should render with an h1 element when variant="title"', () => {
      const tree = shallow(<Breadcrumbs variant="title" items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
      assert.equal(tree.find('.spectrum-Breadcrumb').at(2).find('h1').length, 1);
      assert(tree.find('.spectrum-Breadcrumb').at(2).find('h1').hasClass('spectrum-Heading--pageTitle'));
      assert.equal(tree.find('.spectrum-Breadcrumb').at(2).find('h1').prop('aria-level'), undefined);
    });

    it('h1 element should include an aria-level attribute when ariaLevel is set', () => {
      const tree = shallow(<Breadcrumbs variant="title" ariaLevel="3" items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
      assert.equal(tree.find('.spectrum-Breadcrumb').at(2).find('h1').prop('aria-level'), 3);
    });
  });
});
