import assert from 'assert';
import DialogContent from '../../src/Dialog/js/DialogContent';
import React from 'react';
import {shallow} from 'enzyme';

describe('DialogContent', () => {
  it('supports additional classNames', () => {
    const tree = shallow(render({className: 'myClass'}));
    assert(tree.hasClass('myClass'));
  });

  it('supports children', () => {
    const tree = shallow(render({children: 'Foo'}));
    assert.equal(tree.children().node, 'Foo');
  });
});

const render = props => (
  <DialogContent { ...props } />
);
