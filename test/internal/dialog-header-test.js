import React from 'react';
import expect from 'expect';
import DialogHeader from '../../lib/internal/DialogHeader';
import Icon from '../../lib/Icon';
import Button from '../../lib/Button';
import { shallow } from 'enzyme';

describe('DialogHeader', () => {
  it('supports optional title', () => {
    const tree = shallow(<DialogHeader />);
    expect(tree.find(Icon).node).toNotExist();
    tree.setProps({ icon: 'info' });
    expect(tree.find(Icon).node).toExist();
    expect(tree.find(Icon).prop('icon')).toBe('info');
  });

  it('supports closable', () => {
    const tree = shallow(<DialogHeader />);
    expect(tree.find(Button).node).toNotExist();
    tree.setProps({ closable: true });
    expect(tree.find(Button).node).toExist();
  });

  it('onClose is fired when the close button is clicked', () => {
    const spy = expect.createSpy();
    const tree = shallow(<DialogHeader onClose={ spy } closable />);
    tree.find(Button).simulate('click');
    expect(spy).toHaveBeenCalled();
  });
});
