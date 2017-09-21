import assert from 'assert';
import Breadcrumbs from '../../src/Breadcrumbs';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';

describe('Breadcrumbs', function () {
  it('should render breadcrumbs', function () {
    const tree = shallow(<Breadcrumbs items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    assert.equal(tree.prop('className'), 'spectrum-Breadcrumbs');
    assert.equal(tree.find('.spectrum-Breadcrumb').length, 3);
  });

  it('should support putting an icon at the start', function () {
    const tree = shallow(<Breadcrumbs icon="folder" items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    assert.equal(tree.childAt(0).type(), Icon);
    assert.equal(tree.childAt(0).prop('icon'), 'folder');
  });

  it('should support clicking on a breadcrumb', function () {
    const onBreadcrumbClick = sinon.spy();
    const tree = shallow(<Breadcrumbs onBreadcrumbClick={onBreadcrumbClick} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    tree.childAt(1).simulate('click');
    assert(onBreadcrumbClick.calledOnce);
    assert.deepEqual(onBreadcrumbClick.lastCall.args[0], {label: 'Bar'});
    assert.deepEqual(onBreadcrumbClick.lastCall.args[1], 1);
  });

  it('clicking on the last breadcrumb should do nothing', function () {
    const onBreadcrumbClick = sinon.spy();
    const tree = shallow(<Breadcrumbs onBreadcrumbClick={onBreadcrumbClick} items={[{label: 'Foo'}, {label: 'Bar'}, {label: 'Baz'}]} />);
    tree.childAt(2).simulate('click');
    assert(onBreadcrumbClick.notCalled);
  });
});
