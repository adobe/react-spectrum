import {Checkbox} from '../';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import V2Checkbox from '@react/react-spectrum/Checkbox';


describe('Checkbox', function () {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
    cleanup();
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy}}
    ${'Checkbox isEmphasized'} | ${Checkbox}    | ${{onChange: onChangeSpy, isEmphasized: true}}
    ${'V2Checkbox'}            | ${V2Checkbox}  | ${{onChange: onChangeSpy}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, quiet: true}}
  `('$Name default unchecked can be checked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeFalsy();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(onChangeSpy).not.toHaveBeenCalled();

    userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[0][0]).toBe(true);

    userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[1][0]).toBe(false);

    // would test space key, but then it's just testing the browser, no need
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, defaultSelected: true}}
    ${'Checkbox isEmphasized'} | ${Checkbox}    | ${{onChange: onChangeSpy, defaultSelected: true, isEmphasized: true}}
    ${'V2Checkbox'}            | ${V2Checkbox}  | ${{onChange: onChangeSpy, defaultChecked: true}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, defaultChecked: true, quiet: true}}
  `('$Name can be default checked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeTruthy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[0][0]).toBe(false);
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, isSelected: true}}
    ${'Checkbox isEmphasized'} | ${Checkbox}    | ${{onChange: onChangeSpy, isSelected: true, isEmphasized: true}}
    ${'V2Checkbox'}            | ${V2Checkbox}  | ${{onChange: onChangeSpy, checked: true}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, checked: true, quiet: true}}
  `('$Name can be controlled checked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeTruthy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[0][0]).toBe(false);
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, isSelected: false}}
    ${'Checkbox isEmphasized'} | ${Checkbox}    | ${{onChange: onChangeSpy, isSelected: false, isEmphasized: true}}
    ${'V2Checkbox'}            | ${V2Checkbox}  | ${{onChange: onChangeSpy, checked: false}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, checked: false, quiet: true}}
  `('$Name can be controlled unchecked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeFalsy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[0][0]).toBe(true);
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, isDisabled: true}}
    ${'Checkbox isEmphasized'} | ${Checkbox}    | ${{onChange: onChangeSpy, isDisabled: true, isEmphasized: true}}
    ${'V2Checkbox'}            | ${V2Checkbox}  | ${{onChange: onChangeSpy, disabled: true}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, disabled: true, quiet: true}}
  `('$Name can be disabled', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeFalsy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, validationState: 'invalid'}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, invalid: true, quiet: true}}
  `('$Name can be invalid', function ({Component, props}) {
    let {getByRole} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, isIndeterminate: true}}
    ${'Checkbox isEmphasized'} | ${Checkbox}    | ${{onChange: onChangeSpy, isIndeterminate: true, isEmphasized: true}}
    ${'V2Checkbox'}            | ${V2Checkbox}  | ${{onChange: onChangeSpy, indeterminate: true}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, indeterminate: true, quiet: true}}
  `('$Name can be indeterminate (this one is weird) it is controlled, but not via isSelected', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox.checked).toBeFalsy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).toHaveBeenCalled();
    expect(onChangeSpy.mock.calls[0][0]).toBe(true);

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy.mock.calls[1][0]).toBe(false);

  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, 'aria-label': 'not visible'}}
    ${'V2Checkbox quiet'}      | ${V2Checkbox}  | ${{onChange: onChangeSpy, 'aria-label': 'not visible', quiet: true}}
  `('$Name can have a non-visible label', function ({Component, props}) {
    let {getByRole} = render(<Component {...props} />);

    let checkbox = getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', props['aria-label']);
  });

  /* This one is different, aria-hidden is getting applied to the label, not to the input, because it's the root */
  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, 'aria-hidden': true, 'data-testid': 'target'}}
  `('$Name supports additional props', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props}>Click Me</Component>);

    let checkboxLabel = getByTestId('target');
    expect(checkboxLabel).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
    Name                       | Component      | props
    ${'Checkbox'}              | ${Checkbox}    | ${{onChange: onChangeSpy, isSelected: true, isReadOnly: true}}
  `('$Name supports readOnly', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeTruthy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
