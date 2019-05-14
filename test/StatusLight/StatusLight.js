import assert from 'assert';
import React from 'react';
import {shallow} from 'enzyme';
import StatusLight from '../../src/StatusLight';

describe('StatusLight', () => {
  it('supports variants', () => {
    const tree = shallow(<StatusLight variant="celery">Testing</StatusLight>);
    assert(tree.hasClass('spectrum-StatusLight--celery'));
  });

  it('supports a disabled state', () => {
    const tree = shallow(<StatusLight disabled>Testing</StatusLight>);
    assert(tree.hasClass('is-disabled'));
  });

  it('supports additional classNames', () => {
    const tree = shallow(<StatusLight className="myClass">Testing</StatusLight>);
    assert(tree.hasClass('myClass'));
  });

  it('supports additional properties', () => {
    const tree = shallow(<StatusLight aria-hidden>Testing</StatusLight>);
    assert.equal(tree.prop('aria-hidden'), true);
  });

  it('supports children', () => {
    const tree = shallow(<StatusLight>Testing</StatusLight>);
    assert.equal(tree.childAt(0).text(), 'Testing');
  });
});
