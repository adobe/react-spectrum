import assert from 'assert';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import Icon from '../../src/Icon';
import React from 'react';
import {shallow} from 'enzyme';

describe('DialogHeader', () => {
  it('supports optional title', () => {
    const tree = shallow(<DialogHeader />);
    assert.equal(tree.find(Icon).length, 0);
    tree.setProps({icon: 'info'});
    tree.setProps({title: 'title'});
    assert.equal(tree.find(Icon).length, 1);
    assert.equal(tree.find(Icon).prop('icon'), 'info');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<DialogHeader className="myClass" />);
    assert(tree.hasClass('myClass'));
  });
});
