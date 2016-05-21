import React from 'react';
import expect from 'expect';
import Search from '../components/Search';
import { shallow } from 'enzyme';

describe('Search', () => {
  it('default', () => {
    const tree = shallow(<Search />);
    expect(tree.prop('className')).toBe('coral-DecoratedTextfield');

    const icon = tree.find('.coral-DecoratedTextfield-icon');
    expect(icon.prop('className')).toBe('coral-DecoratedTextfield-icon');
    expect(icon.prop('icon')).toBe('search');
    expect(icon.prop('size')).toBe('S');

    const input = findInput(tree);
    expect(icon.prop('className')).toBe('coral-DecoratedTextfield-icon');

    const button = findButton(tree);
    expect(button.node).toNotExist();
  });

  it('shows clear button if text exists', () => {
    const tree = shallow(<Search defaultValue="foo" />);
    const button = findButton(tree);
    expect(button.prop('variant')).toBe('minimal');
    expect(button.prop('icon')).toBe('close');
    expect(button.prop('iconSize')).toBe('XS');
    expect(button.prop('square')).toBe(true);
    expect(button.prop('className')).toBe('coral-DecoratedTextfield-button');
  });

  describe('onSubmit', () => {
    let spy, preventDefaultSpy;

    beforeEach(() => {
      spy = expect.createSpy();
      preventDefaultSpy = expect.createSpy();
    });

    it('is called when enter is pressed', () => {
      const tree = shallow(<Search onSubmit={ spy } />);
      findInput(tree).simulate('keyDown', { which: 13, preventDefault: preventDefaultSpy });
      expect(spy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('is not called when enter is pressed if it is disabled', () => {
      const tree = shallow(<Search onSubmit={ spy } disabled />);
      findInput(tree).simulate('keyDown', { which: 13, preventDefault: preventDefaultSpy });
      expect(spy).toNotHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('onClear', () => {
    let spy, preventDefaultSpy;

    beforeEach(() => {
      spy = expect.createSpy();
      preventDefaultSpy = expect.createSpy();
    });

    it('is called when escape is pressed', () => {
      const tree = shallow(<Search onClear={ spy } />);
      findInput(tree).simulate('keyDown', { which: 27, preventDefault: preventDefaultSpy });
      expect(spy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('is called when the clear button is pressed', () => {
      const tree = shallow(<Search onClear={ spy } defaultValue="foo" />);
      findButton(tree).simulate('click');
      expect(spy).toHaveBeenCalled();
    });

    it('is not called when escape is pressed if it is disabled', () => {
      const tree = shallow(<Search onClear={ spy } defaultValue="foo" disabled />);
      findInput(tree).simulate('keyDown', { which: 27, preventDefault: preventDefaultSpy });
      expect(spy).toNotHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('is not called when the clear button is preseed if it is disabled', () => {
      const tree = shallow(<Search onClear={ spy } defaultValue="foo" disabled />);
      findButton(tree).simulate('click');
      expect(spy).toNotHaveBeenCalled();
    });
  });

  it('calls onChange when text is entered', () => {
    const spy = expect.createSpy();
    const tree = shallow(<Search onChange={ spy } />);
    expect(tree.state('value')).toBe('');
    expect(tree.state('emptyText')).toBe(true);
    
    findInput(tree).simulate('change', { target: { value: 'a' } });
    expect(spy).toHaveBeenCalled();
    expect(tree.state('value')).toBe('a');
    expect(tree.state('emptyText')).toBe(false);
  });

  it('supports disabled', () => {
    const tree = shallow(<Search defaultValue="foo" disabled />);
    expect(findInput(tree).prop('disabled')).toBe(true);
    expect(findButton(tree).prop('disabled')).toBe(true);
  });

  it('supports additional classNames', () => {
    const tree = shallow(<Search className="myClass" />);
    expect(tree.prop('className')).toBe('coral-DecoratedTextfield myClass');
  });

  it('supports additional properties', () => {
    const tree = shallow(<Search foo />);
    expect(findInput(tree).prop('foo')).toBe(true);
  });
});

const findInput = tree => tree.find('.coral-DecoratedTextfield-input');
const findButton = tree => tree.find('.coral-DecoratedTextfield-button');
