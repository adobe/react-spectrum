import assert from 'assert';
import DialogButtons from '../../src/Dialog/js/DialogButtons';
import DialogHeader from '../../src/Dialog/js/DialogHeader';
import React from 'react';
import {shallow} from 'enzyme';

describe('DialogHeader', () => {
  it('supports optional title', () => {
    const tree = shallow(<DialogHeader />);
    tree.setProps({title: 'title'});
    assert.equal(tree.find(DialogButtons).length, 0);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<DialogHeader className="myClass" />);
    assert(tree.hasClass('myClass'));
  });

  it('supports fullscreen mode', () => {
    const tree = shallow(<DialogHeader fullscreen confirmLabel="Go" />);
    assert.equal(tree.find(DialogButtons).length, 1);
  });

  it('supports fullscreen takeover mode', () => {
    const tree = shallow(<DialogHeader fullscreen confirmLabel="Go" />);
    assert.equal(tree.find(DialogButtons).length, 1);
  });

  it('supports disabling confirm button', () => {
    const tree = shallow(<DialogHeader fullscreen confirmLabel="OK" confirmDisabled />);
    assert(tree.find(DialogButtons).prop('confirmDisabled'));
    assert(tree.find(DialogButtons).shallow().find('Button').prop('disabled'));
    tree.setProps({confirmDisabled: false});
    assert(!tree.find(DialogButtons).prop('confirmDisabled'));
    assert(!tree.find(DialogButtons).shallow().find('Button').prop('disabled'));
  });
});
