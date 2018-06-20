import assert from 'assert';
import Banner from '../../src/Banner';
import React from 'react';
import {shallow} from 'enzyme';

describe('Banner', () => {
  it('supports variants, default info', () => {
    let tree = shallow(<Banner variant="warning" />);
    assert(tree.hasClass('spectrum-Banner--warning'));

    tree = shallow(<Banner />);
    assert(tree.hasClass('spectrum-Banner--info'));
  });

  it('supports corner placement', () => {
    let tree = shallow(<Banner corner />);
    assert(tree.hasClass('spectrum-Banner--corner'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Banner className="myClass" />);
    assert(tree.hasClass('myClass'));
  });

  it('supports additional properties', () => {
    const tree = shallow(<Banner data-foo />);
    assert.equal(tree.prop('data-foo'), true);

  });
});
