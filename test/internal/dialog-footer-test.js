import React from 'react';
import expect from 'expect';
import DialogFooter from '../../src/internal/DialogFooter';
import Button from '../../src/Button';
import { shallow } from 'enzyme';

describe('DialogFooter', () => {
  it('renders an OK button if no children are supplied', () => {
    const tree = shallow(<DialogFooter />);
    const button = tree.find(Button);
    expect(button.prop('variant')).toBe('primary');
    expect(button.prop('label')).toBe('OK');
  });

  it('supports onClose', () => {
    const spy = expect.createSpy();
    const tree = shallow(<DialogFooter onClose={ spy } />);
    tree.find(Button).simulate('click');
    expect(spy).toHaveBeenCalled();
  });

  describe('adds onClose to children with close-dialog property on them', () => {
    const render = (onCloseSpy, onClickSpy) => (
      shallow(
        <DialogFooter onClose={ onCloseSpy }>
          <Button label="Foo" onClick={ onClickSpy || null } close-dialog />
        </DialogFooter>
      ).find({ label: 'Foo' })
    );

    it('by adding onClick handler', () => {
      const spy = expect.createSpy();
      const child = render(spy);
      expect(child.prop('close-dialog')).toNotExist();
      child.simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('without overriding onClick handler', () => {
      const spy = expect.createSpy();
      const otherSpy = expect.createSpy();
      const child = render(spy, otherSpy);
      expect(child.prop('close-dialog')).toNotExist();
      child.simulate('click');

      expect(spy).toHaveBeenCalled();
      // Any onClick added to the child component manually should still be called.
      expect(otherSpy).toHaveBeenCalled();
    });
  });

  it('supports children', () => {
    const tree = shallow(<DialogFooter>Foo</DialogFooter>);
    expect(tree.text()).toBe('Foo');
  });

  it('supports additional classNames', () => {
    const tree = shallow(<DialogFooter className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<DialogFooter foo />);
    expect(tree.prop('foo')).toBe(true);
  });
});
