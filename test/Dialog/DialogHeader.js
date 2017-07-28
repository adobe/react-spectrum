import assert from 'assert';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import React from 'react';
import {shallow} from 'enzyme';

describe('DialogHeader', () => {
  it('supports optional title', () => {
    const tree = shallow(<DialogHeader />);
    tree.setProps({title: 'title'});
  });

  it('supports additional classNames', () => {
    const tree = shallow(<DialogHeader className="myClass" />);
    assert(tree.hasClass('myClass'));
  });
});
