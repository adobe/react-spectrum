import assert from 'assert';
import {MenuHeading} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import React from 'react';

describe('MenuHeading', () => {
  it('renders a li element with a Menu sectionHeading class and role="heading"', () => {
    let tree = shallow(<MenuHeading label="foo" />);
    let heading = tree.find('li.spectrum-Menu-sectionHeading');
    assert.equal(heading.length, 1);
    assert.equal(heading.childAt(0).prop('role'), 'heading');
    assert.equal(heading.childAt(0).prop('aria-level'), 3);
  });
  it('should set aria-level', () => {
    let tree = shallow(<MenuHeading label="foo" />);
    let heading = tree.find('li.spectrum-Menu-sectionHeading');
    assert.equal(heading.childAt(0).prop('aria-level'), 3);
    tree.setProps({'aria-level': 4});
    assert.equal(tree.find('li.spectrum-Menu-sectionHeading').childAt(0).prop('aria-level'), 4);
  });
  it('places label text as children of the li element', () => {
    let tree = mount(<MenuHeading label="foo" />);
    let heading = tree.find('li.spectrum-Menu-sectionHeading').at(0);
    assert.equal(heading.text(), 'foo');
    tree.unmount();
  });
});
