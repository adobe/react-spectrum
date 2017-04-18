import React from 'react';
import expect from 'expect';
import { shallow } from 'enzyme';
import NumberInput from '../src/NumberInput';
import Textfield from '../src/Textfield';
import Button from '../src/Button';
import InputGroup from '../src/InputGroup';

describe('NumberInput', () => {
  it('default', () => {
    const assertDefaultButtonProps = (button, inputId) => {
      expect(button.prop('type')).toBe('button');
      expect(button.prop('aria-controls')).toBe(inputId);
      expect(button.prop('variant')).toBe('secondary');
      expect(button.prop('iconSize')).toBe('XS');
      expect(button.prop('tabIndex')).toBe('-1');
      expect(button.prop('square')).toBe(true);
      expect(button.prop('disabled')).toBe(false);
    };

    const tree = shallow(<NumberInput />);
    expect(tree.hasClass('coral3-NumberInput')).toBe(true);
    expect(tree.type()).toBe(InputGroup);

    const input = findInput(tree);
    const inputId = input.prop('id');
    expect(inputId).toExist();
    expect(input.prop('defaultValue')).toBe(undefined);
    expect(input.prop('role')).toBe('spinbutton');
    expect(input.prop('aria-valuenow')).toBe('');
    expect(input.prop('aria-valuetext')).toBe('');
    expect(input.prop('step')).toBe(1);
    expect(input.prop('placeholder')).toBe('Enter a number');
    expect(input.prop('disabled')).toBe(false);
    expect(input.prop('readOnly')).toBe(false);
    expect(input.prop('invalid')).toBe(false);
    expect(input.hasClass('coral-InputGroup-input')).toBe(true);

    const decButton = findDecrementButton(tree);
    assertDefaultButtonProps(decButton, inputId);
    expect(decButton.prop('title')).toBe('Decrement');

    const incButton = findIncrementButton(tree);
    assertDefaultButtonProps(incButton, inputId);
    expect(incButton.prop('title')).toBe('Increment');

    const buttonWrappers = tree.find('.coral-InputGroup-button');
    buttonWrappers.forEach(wrapper => {
      expect(wrapper.prop('role')).toBe('presentation');
    });
  });

  it('supports placeholder', () => {
    const tree = shallow(<NumberInput placeholder="foo" />);
    const input = findInput(tree);
    expect(input.prop('placeholder')).toBe('foo');
  });

  it('supports decrementTitle', () => {
    const tree = shallow(<NumberInput decrementTitle="foo" />);
    const button = findDecrementButton(tree);
    expect(button.prop('title')).toBe('foo');
  });

  it('supports incrementTitle', () => {
    const tree = shallow(<NumberInput incrementTitle="foo" />);
    const button = findIncrementButton(tree);
    expect(button.prop('title')).toBe('foo');
  });

  it('supports readOnly', () => {
    const tree = shallow(<NumberInput readOnly />);
    const input = findInput(tree);
    expect(input.prop('readOnly')).toBe(true);
    findAllButtons(tree).forEach(button => {
      expect(button.prop('disabled')).toBe(true);
    });
  });

  it('supports disabled', () => {
    const tree = shallow(<NumberInput disabled />);
    const input = findInput(tree);
    expect(input.prop('disabled')).toBe(true);
    findAllButtons(tree).forEach(button => {
      expect(button.prop('disabled')).toBe(true);
    });
  });

  it('supports overriding id', () => {
    const tree = shallow(<NumberInput id="foo" />);
    expect(findInput(tree).prop('id')).toBe('foo');
    findAllButtons(tree).forEach(wrapper => {
      expect(wrapper.prop('aria-controls')).toBe('foo');
    });
  });

  describe('supports step', () => {
    let tree;
    let spy;
    let preventDefaultSpy;

    beforeEach(() => {
      spy = expect.createSpy();
      preventDefaultSpy = expect.createSpy();
      tree = shallow(<NumberInput step={ 0.5 } onChange={ spy } />);
    });

    it('adds prop to input', () => {
      expect(findInput(tree).prop('step')).toBe(0.5);
    });

    describe('calls change with proper stepped value', () => {
      it('when increment button is clicked', () => {
        findIncrementButton(tree).simulate('click', { preventDefault: preventDefaultSpy });
        expect(spy).toHaveBeenCalledWith(0.5);
        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      it('when decrement button is clicked', () => {
        findDecrementButton(tree).simulate('click', { preventDefault: preventDefaultSpy });
        expect(spy).toHaveBeenCalledWith(-0.5);
        expect(preventDefaultSpy).toHaveBeenCalled();
      });

      describe('when mouse wheel is scrolled', () => {
        const simulateWheel = (deltaY = 5) => {
          findInput(tree).simulate('wheel', { deltaY, preventDefault: preventDefaultSpy });
        };

        it('up', () => {
          tree.setState({ focused: true });
          simulateWheel(-4.5);
          expect(spy).toHaveBeenCalledWith(0.5);
          expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('down', () => {
          tree.setState({ focused: true });
          simulateWheel(2);
          expect(spy).toHaveBeenCalledWith(-0.5);
          expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('unless input is not focused or readOnly or disabled', () => {
          tree.setProps({ disabled: true });
          simulateWheel();
          expect(spy).toNotHaveBeenCalled();

          tree.setProps({ disabled: false, readOnly: true });
          simulateWheel();
          expect(spy).toNotHaveBeenCalled();

          tree.setProps({ disabled: false, readOnly: false });
          tree.setState({ focused: false });
          simulateWheel();
          expect(spy).toNotHaveBeenCalled();
        });
      });

      it('when up or page up arrow keys are pressed', () => {
        const input = findInput(tree);
        input.simulate('keyDown', { keyCode: 38, preventDefault: preventDefaultSpy }); // up arrow
        expect(spy).toHaveBeenCalledWith(0.5);
        input.simulate('keyDown', { keyCode: 33, preventDefault: preventDefaultSpy }); // page up
        expect(spy).toHaveBeenCalledWith(1);
        expect(preventDefaultSpy.calls.length).toEqual(2);
      });

      it('when down or page down arrow keys are pressed', () => {
        const input = findInput(tree);
        input.simulate('keyDown', { keyCode: 40, preventDefault: preventDefaultSpy }); // down arrow
        expect(spy).toHaveBeenCalledWith(-0.5);
        input.simulate('keyDown', { keyCode: 34, preventDefault: preventDefaultSpy }); // page down
        expect(spy).toHaveBeenCalledWith(-1);
        expect(preventDefaultSpy.calls.length).toEqual(2);
      });
    });
  });

  it('sets focused class when focused', () => {
    const tree = shallow(<NumberInput />);
    findInput(tree).simulate('focus');
    expect(tree.hasClass('is-focused')).toBe(true);
    expect(findInput(tree).hasClass('is-focused')).toBe(true);
    findInput(tree).simulate('blur');
    expect(tree.hasClass('is-focused')).toBe(false);
    expect(findInput(tree).hasClass('is-focused')).toBe(false);
  });

  describe('support max', () => {
    describe('if value is greater than or equal', () => {
      let tree;
      let spy;
      let preventDefaultSpy;

      beforeEach(() => {
        spy = expect.createSpy();
        preventDefaultSpy = expect.createSpy();
        tree = shallow(<NumberInput max={ 10 } value={ 10 } onChange={ spy } />);
      });

      it('disables increment button', () => {
        expect(findIncrementButton(tree).prop('disabled')).toBe(true);
      });

      it('won\'t increment if up arrow pressed', () => {
        findInput(tree).simulate('keyDown', { keyCode: 38, preventDefault: preventDefaultSpy });
        expect(spy).toNotHaveBeenCalled();
      });

      describe('will jump value to max if home key is pressed', () => {
        const simulateKeyDown = () => {
          findInput(tree).simulate('keyDown', { keyCode: 36, preventDefault: preventDefaultSpy });
        };

        it('unless input is not focused or readOnly or disabled', () => {
          tree.setProps({ disabled: true });
          simulateKeyDown();
          expect(spy).toNotHaveBeenCalled();

          tree.setProps({ disabled: false, readOnly: true });
          simulateKeyDown();
          expect(spy).toNotHaveBeenCalled();

          tree.setProps({ disabled: false, readOnly: false });
          tree.setState({ focused: false });
          simulateKeyDown();
          expect(spy).toNotHaveBeenCalled();
        });

        it('and the input can accept input', () => {
          tree.setState({ focused: true });
          tree.setProps({ value: 1 });
          simulateKeyDown();
          expect(spy).toHaveBeenCalledWith(10);
          expect(preventDefaultSpy).toHaveBeenCalled();
        });
      });

      it('will allow changing value greater than max, but marks it invalid', () => {
        tree.setProps({ value: 12 });
        expect(findIncrementButton(tree).prop('disabled')).toBe(true);
        expect(findInput(tree).prop('invalid')).toBe(true);
      });
    });
  });

  describe('support min', () => {
    describe('if value is less than or equal', () => {
      let tree;
      let spy;
      let preventDefaultSpy;

      beforeEach(() => {
        spy = expect.createSpy();
        preventDefaultSpy = expect.createSpy();
        tree = shallow(<NumberInput min={ -10 } value={ -10 } onChange={ spy } />);
      });

      it('disables decrement button', () => {
        expect(findDecrementButton(tree).prop('disabled')).toBe(true);
      });

      it('won\'t decrement if down arrow pressed', () => {
        findInput(tree).simulate('keyDown', { keyCode: 40, preventDefault: preventDefaultSpy });
        expect(spy).toNotHaveBeenCalled();
      });

      describe('will jump value to max if end key is pressed', () => {
        const simulateKeyDown = () => {
          findInput(tree).simulate('keyDown', { keyCode: 35, preventDefault: preventDefaultSpy });
        };

        it('unless input is not focused or readOnly or disabled', () => {
          tree.setProps({ disabled: true });
          simulateKeyDown();
          expect(spy).toNotHaveBeenCalled();

          tree.setProps({ disabled: false, readOnly: true });
          simulateKeyDown();
          expect(spy).toNotHaveBeenCalled();

          tree.setProps({ disabled: false, readOnly: false });
          tree.setState({ focused: false });
          simulateKeyDown();
          expect(spy).toNotHaveBeenCalled();
        });

        it('and the input can accept input', () => {
          tree.setState({ focused: true });
          tree.setProps({ value: -1 });
          simulateKeyDown();
          expect(spy).toHaveBeenCalledWith(-10);
          expect(preventDefaultSpy).toHaveBeenCalled();
        });
      });

      it('will allow setting value to less than min, but marks it invalid', () => {
        tree.setProps({ value: -12 });
        expect(findDecrementButton(tree).prop('disabled')).toBe(true);
        expect(tree.state('valueInvalid')).toBe(true);
        expect(findInput(tree).prop('invalid')).toBe(true);
      });

      it('will allow input change value to be less than min, but marks it invalid', () => {
        const spSpy = expect.createSpy();
        findInput(tree).simulate('change', { target: { value: -12 }, stopPropagation: spSpy });
        expect(findDecrementButton(tree).prop('disabled')).toBe(true);
        expect(tree.state('valueInvalid')).toBe(true);
        expect(findInput(tree).prop('invalid')).toBe(true);
        expect(spSpy).toHaveBeenCalled();
      });
    });
  });

  describe('input change', () => {
    let tree;
    let spy;
    let spSpy;

    beforeEach(() => {
      spSpy = expect.createSpy();
      spy = expect.createSpy();
      tree = shallow(<NumberInput defaultValue={ 1 } onChange={ spy } />);
    });

    it('will not allow non-numeric characters', () => {
      findInput(tree).simulate('change', { target: { value: 'foo' }, stopPropagation: spSpy });
      expect(spy).toNotHaveBeenCalled();
      expect(findInput(tree).prop('value')).toBe(1);
      expect(spSpy).toHaveBeenCalled();
    });

    it('will allow a single negative sign even though it is not a number', () => {
      findInput(tree).simulate('change', { target: { value: '-' }, stopPropagation: spSpy });
      expect(spy).toNotHaveBeenCalled();
      expect(findInput(tree).prop('value')).toBe('-');
      expect(spSpy).toHaveBeenCalled();
    });

    it('will allow numeric values', () => {
      findInput(tree).simulate('change', { target: { value: '-5' }, stopPropagation: spSpy });
      expect(spy).toHaveBeenCalledWith(-5);
      expect(tree.state('value')).toBe('-5');
      expect(findInput(tree).prop('value')).toBe('-5');
      expect(spSpy).toHaveBeenCalled();
    });
  });

  it('supports additional classNames', () => {
    const tree = shallow(<NumberInput className="myClass" />);
    expect(tree.hasClass('myClass')).toBe(true);
  });

  it('supports additional properties', () => {
    const tree = shallow(<NumberInput foo />);
    expect(findInput(tree).prop('foo')).toBe(true);
  });
});

const findInput = tree => tree.find(Textfield);
const findAllButtons = tree => tree.find(Button);
const findDecrementButton = tree => tree.find({ icon: 'chevronDown' });
const findIncrementButton = tree => tree.find({ icon: 'chevronUp' });
