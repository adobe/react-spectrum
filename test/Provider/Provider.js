import assert from 'assert';
import Provider from '../../src/Provider';
import React from 'react';
import {shallow} from 'enzyme';

describe('Provider', () => {
  it('has correct defaults', () => {
    const tree = shallow(<Provider />);
    assert(tree.hasClass('spectrum'));
    assert(tree.hasClass('spectrum--light'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Provider className="foo" />);
    assert.equal(tree.hasClass('foo'), true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<Provider aria-foo />);
    assert.equal(tree.prop('aria-foo'), true);
    assert.equal(tree.shallow().find('div').prop('aria-foo'), true);
  });
});
