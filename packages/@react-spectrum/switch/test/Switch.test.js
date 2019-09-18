import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {Switch} from '../';
import userEvent from '@testing-library/user-event';
import V2Switch from '@react/react-spectrum/Switch';


describe('Switch', function () {
  let onChangeSpy = jest.fn();

  afterEach(() => {
    onChangeSpy.mockClear();
    cleanup();
  });

  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy}}
    ${'Switch isEmphasized'} | ${Switch}    | ${{onChange: onChangeSpy, isEmphasized: true}}
    ${'V2Switch'}            | ${V2Switch}  | ${{onChange: onChangeSpy}}
    ${'V2Switch quiet'}      | ${V2Switch}  | ${{onChange: onChangeSpy, quiet: true}}
  `('$Name default unchecked can be checked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeFalsy();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(onChangeSpy).not.toHaveBeenCalled();

    userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).toHaveBeenCalledWith(true, expect.anything());

    userEvent.click(checkbox);
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(onChangeSpy).toHaveBeenCalledWith(false, expect.anything());

    // would test space key, but then it's just testing the browser, no need
  });

  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy, defaultSelected: true}}
    ${'Switch isEmphasized'} | ${Switch}    | ${{onChange: onChangeSpy, defaultSelected: true, isEmphasized: true}}
    ${'V2Switch'}            | ${V2Switch}  | ${{onChange: onChangeSpy, defaultChecked: true}}
    ${'V2Switch quiet'}      | ${V2Switch}  | ${{onChange: onChangeSpy, defaultChecked: true, quiet: true}}
  `('$Name can be default checked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeTruthy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy).toHaveBeenCalledWith(false, expect.anything());
  });

  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy, isSelected: true}}
    ${'Switch isEmphasized'} | ${Switch}    | ${{onChange: onChangeSpy, isSelected: true, isEmphasized: true}}
    ${'V2Switch'}            | ${V2Switch}  | ${{onChange: onChangeSpy, checked: true}}
    ${'V2Switch quiet'}      | ${V2Switch}  | ${{onChange: onChangeSpy, checked: true, quiet: true}}
  `('$Name can be controlled checked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeTruthy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).toHaveBeenCalledWith(false, expect.anything());
  });

  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy, isSelected: false}}
    ${'Switch isEmphasized'} | ${Switch}    | ${{onChange: onChangeSpy, isSelected: false, isEmphasized: true}}
    ${'V2Switch'}            | ${V2Switch}  | ${{onChange: onChangeSpy, checked: false}}
    ${'V2Switch quiet'}      | ${V2Switch}  | ${{onChange: onChangeSpy, checked: false, quiet: true}}
  `('$Name can be controlled unchecked', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeFalsy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy).toHaveBeenCalledWith(true, expect.anything());
  });

  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy, isDisabled: true}}
    ${'Switch isEmphasized'} | ${Switch}    | ${{onChange: onChangeSpy, isDisabled: true, isEmphasized: true}}
    ${'V2Switch'}            | ${V2Switch}  | ${{onChange: onChangeSpy, disabled: true}}
    ${'V2Switch quiet'}      | ${V2Switch}  | ${{onChange: onChangeSpy, disabled: true, quiet: true}}
  `('$Name can be disabled', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeFalsy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeFalsy();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });

  /* This one is different, aria-hidden is getting applied to the label, not to the input, because it's the root */
  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy, 'aria-hidden': true, 'data-testid': 'target'}}
  `('$Name supports additional props', function ({Component, props}) {
    let {getByTestId} = render(<Component {...props}>Click Me</Component>);

    let checkboxLabel = getByTestId('target');
    expect(checkboxLabel).toHaveAttribute('aria-hidden', 'true');
  });

  it.each`
    Name                     | Component    | props
    ${'Switch'}              | ${Switch}    | ${{onChange: onChangeSpy, isSelected: true, isReadOnly: true}}
  `('$Name supports readOnly', function ({Component, props}) {
    let {getByLabelText} = render(<Component {...props}>Click Me</Component>);

    let checkbox = getByLabelText('Click Me');
    expect(checkbox.checked).toBeTruthy();

    userEvent.click(checkbox);
    expect(checkbox.checked).toBeTruthy();
    expect(onChangeSpy).not.toHaveBeenCalled();
  });
});
