import {ActionButton, Button, ClearButton, LogicButton} from '../';
import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {triggerPress} from '@react-spectrum/utils';
import V2Button from '@react/react-spectrum/Button';

let FakeIcon = (props) => <svg {...props}><path d="M 10,150 L 70,10 L 130,150 z" /></svg>;
/**
 * Logic Button has no tests outside of this file because functionally it is identical
 * to Button right now. The only difference is the class names, and since we aren't
 * testing that, these are all the tests we need to cover Logic Button.
 */

describe('Button', function () {
  let onPressSpy = jest.fn();

  afterEach(() => {
    cleanup();
    onPressSpy.mockClear();
  });

  it.each`
    Component      | props
    ${ActionButton}| ${{onPress: onPressSpy}}
    ${Button}      | ${{onPress: onPressSpy}}
    ${LogicButton} | ${{onPress: onPressSpy}}
    ${V2Button}    | ${{onClick: onPressSpy}}
  `('v2/3 parity handles defaults', function ({Component, props}) {
    let {getByRole, getByText} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    let text = getByText('Click Me');
    expect(text).not.toBeNull();
  });

  it.each`
    Component
    ${ActionButton}
    ${Button}
    ${ClearButton}
    ${LogicButton}
    ${V2Button}
  `('v2/3 parity allows custom props to be passed through to the button', function ({Component}) {
    let {getByRole} = render(<Component data-foo="bar" aria-hidden name="s">Click Me</Component>);

    let button = getByRole('button');
    expect(button).toHaveAttribute('data-foo', 'bar');
    expect(button).toHaveAttribute('aria-hidden', 'true');
    expect(button).toHaveAttribute('name', 's');
  });

  it.each`
    Component
    ${ActionButton}
    ${Button}
    ${ClearButton}
    ${LogicButton}
    ${V2Button}
  `('v2/3 parity allows a custom classname on the button', function ({Component}) {
    let {getByRole} = render(<Component className="x-men-first-class">Click Me</Component>);

    let button = getByRole('button');
    expect(button.getAttribute('class')).toEqual(expect.stringContaining('x-men-first-class'));
  });

  it.each`
    Component
    ${ActionButton}
    ${Button}
    ${ClearButton}
    ${LogicButton}
    ${V2Button}
  `('v2/3 parity handles deprecated onClick', function ({Component}) {
    let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let {getByRole} = render(<Component onClick={onPressSpy}>Click Me</Component>);

    let button = getByRole('button');
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
    if (Component === Button) {
      expect(spyWarn).toHaveBeenCalledWith('onClick is deprecated, please use onPress');
    }
  });

  it.each`
    Component      | props
    ${ActionButton}| ${{onPress: onPressSpy, elementType: 'a'}}
    ${Button}      | ${{onPress: onPressSpy, elementType: 'a'}}
    ${LogicButton} | ${{onPress: onPressSpy, elementType: 'a'}}
    ${V2Button}    | ${{onClick: onPressSpy, element: 'a'}}
  `('v2/3 parity can have elementType=a', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, {key: 'Enter', code: 13});
    fireEvent.keyUp(button, {key: 'Enter', code: 13});
    expect(onPressSpy).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(button, {key: ' ', code: 32});
    fireEvent.keyUp(button, {key: ' ', code: 32});
    expect(onPressSpy).toHaveBeenCalledTimes(3);
  });

  it.each`
    Component      | props
    ${ActionButton}| ${{onPress: onPressSpy, elementType: 'a', href: 'https://adobe.com'}}
    ${Button}      | ${{onPress: onPressSpy, elementType: 'a', href: 'https://adobe.com'}}
    ${LogicButton} | ${{onPress: onPressSpy, elementType: 'a', href: 'https://adobe.com'}}
    ${V2Button}    | ${{onClick: onPressSpy, element: 'a', href: 'https://adobe.com'}}
  `('v2/3 parity can have elementType=a with an href', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(button).toHaveAttribute('href', 'https://adobe.com');
    triggerPress(button);
    expect(onPressSpy).toHaveBeenCalledTimes(1);
  });

  it.each`
    Component      | props
    ${ActionButton}| ${{onPress: onPressSpy, isDisabled: true}}
    ${Button}      | ${{onPress: onPressSpy, isDisabled: true}}
    ${ClearButton} | ${{onPress: onPressSpy, isDisabled: true}}
    ${LogicButton} | ${{onPress: onPressSpy, isDisabled: true}}
    ${V2Button}    | ${{onClick: onPressSpy, disabled: true}}
  `('v2/3 parity does not respond when disabled', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let button = getByRole('button');
    triggerPress(button);
    expect(onPressSpy).not.toHaveBeenCalled();
  });

  // when a user uses the keyboard and keyDowns 'enter' or 'space' on a button, it fires an onclick.
  // when code dispatches a keyDown for 'enter' or 'space', it does not fire onclick
  // this means that it's impossible for us to write a test for the 'button' elementType for keyDown 'enter' or 'space'
  // see https://jsfiddle.net/snowystinger/z6vmrw4d/1/
  // it's also extraneous to test with 'enter' or 'space' on a button because it'd just be testing
  // the spec https://www.w3.org/TR/WCAG20-TECHS/SCR35.html

  it.each`
    Component      | props
    ${ActionButton}| ${{icon: <FakeIcon role="status" />}}
    ${Button}      | ${{icon: <FakeIcon role="status" />}}
    ${LogicButton} | ${{icon: <FakeIcon role="status" />}}
    ${V2Button}    | ${{icon: <FakeIcon role="status" />}}
  `('v2/3 parity accepts an icon as a prop', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);

    let icon = getByRole('status');
    expect(icon).not.toBeNull();
  });
});
