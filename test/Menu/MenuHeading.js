import assert from 'assert';
import {MenuHeading} from '../../src/Menu';
import {mount, shallow} from 'enzyme';
import React from 'react';

describe('MenuHeading', () => {
  it('renders an h4 element with a SelectList sectionHeading class', () => {
    let tree = shallow(<MenuHeading label="foo" />);
    assert.equal(tree.find('h4.spectrum-Menu-sectionHeading').length, 1);
  });
  it('places label text as children of the h4 element', () => {
    let tree = mount(<MenuHeading label="foo" />);
    let heading = tree.find('h4').at(0);
    assert.equal(heading.text(), 'foo');
  });
});
