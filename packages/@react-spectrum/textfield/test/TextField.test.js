import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {SearchField} from '@react-spectrum/searchfield';
import {TextArea, TextField} from '../';
import userEvent from '@testing-library/user-event';
import V2SearchField from '@react/react-spectrum/Search';
import V2TextArea from '@react/react-spectrum/Textarea';
import V2TextField from '@react/react-spectrum/Textfield';

let testId = 'test-id';
let inputText = 'blah';

function renderComponent(Component, props) {
  return render(<Component {...props} data-testid={testId} />);
}

// Note: Running this test suite will result in some warnings of the following class:
// 1. "Textfield contains an input of type search with both value and defaultValue props.  This is a v2 SearchField issue
// 2. Various warnings about componentWillReceiveProps and componentDidUpdate. Prob a TODO to update v2 components so we don't use these renamed/deprecated lifecycle methods 

describe('Shared TextField behavior', () => {
  let onBlur = jest.fn();
  let onChange = jest.fn();
  let onFocus = jest.fn();

  afterEach(() => {
    onChange.mockClear();
    onBlur.mockClear();
    onFocus.mockClear();
    cleanup();
  }); 

  // Omitting v3 TextField and TextArea for now since we need https://jira.corp.adobe.com/browse/RSP-1182 to compensate
  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name supports appending custom classnames onto the root element', ({Component}) => {
    let className = 'custom-class-name';
    let tree = renderComponent(Component, {className});
    expect(tree.container.querySelector(`body>div> .${className}`)).toBeTruthy();
  });  

  it.each`
    Name                | Component        | expectedType | expectedTagName
    ${'v3 TextField'}   | ${TextField}     | ${'text'}    | ${'INPUT'}
    ${'v3 TextArea'}    | ${TextArea}      | ${'text'}    | ${'TEXTAREA'}
    ${'v3 SearchField'} | ${SearchField}   | ${'search'}  | ${'INPUT'}
    ${'v2 TextField'}   | ${V2TextField}   | ${'text'}    | ${'INPUT'}
    ${'v2 TextArea'}    | ${V2TextArea}    | ${'text'}    | ${'TEXTAREA'}
    ${'v2 SearchField'} | ${V2SearchField} | ${'search'}  | ${'INPUT'}
  `('$Name renders with default textfield behavior', ({Component, expectedType, expectedTagName}) => {
    let tree = renderComponent(Component);
    let input = tree.getByTestId(testId);
    expect(input.value).toBe('');
    userEvent.type(input, inputText);
    expect(input.value).toBe(inputText);
    expect(input).toHaveAttribute('type', expectedType);
    expect(input.tagName).toBe(expectedTagName);
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name allow custom naming', ({Component}) => {  
    let name = 'blah';
    let tree = renderComponent(Component, {name});
    let input = tree.getByTestId(testId);
    expect(input).toHaveAttribute('name', name);
  });  

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name renders with placeholder text', ({Component}) => {
    let tree = renderComponent(Component, {placeholder: inputText});
    expect(tree.getByPlaceholderText(inputText)).toBeTruthy();
    let input = tree.getByTestId(testId);
    expect(input.placeholder).toBe(inputText);
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name calls onChange when text changes', ({Component}) => {
    let tree = renderComponent(Component, {onChange});
    let input = tree.getByTestId(testId);
    fireEvent.change(input, {target: {value: inputText}});
    expect(onChange).toHaveBeenCalledTimes(1);

    if (Component === V2SearchField) {
      expect(onChange).toHaveBeenLastCalledWith(
        inputText, 
        expect.anything(),
        {
          'from': 'input'
        }
      );
    } else {
      expect(onChange).toHaveBeenLastCalledWith(
        inputText,
        expect.anything()
      );
    }
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name calls onFocus when the the input field is focused', ({Component}) => {
    let tree = renderComponent(Component, {onFocus});
    let input = tree.getByTestId(testId);
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    userEvent.click(input);
    expect(onFocus).toHaveBeenCalledTimes(2);
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name calls onBlur when the input field loses focus', ({Component}) => {
    let tree = renderComponent(Component, {onBlur});
    let input = tree.getByTestId(testId);
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name is uncontrolled if defaultValue prop is provided', ({Component}) => {
    let defaultValue = 'test';
    let newValue = 'blah';
    let tree = renderComponent(Component, {onChange, defaultValue});
    let input = tree.getByTestId(testId);
    expect(input.value).toBe(defaultValue);
    userEvent.type(input, newValue);
    expect(input.value).toBe(newValue);
    expect(onChange).toHaveBeenCalledTimes(newValue.length);
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name is controlled if value prop is provided', ({Component}) => {
    let value = 'test';
    let newValue = 'blah';
    let tree = renderComponent(Component, {onChange, value});
    let input = tree.getByTestId(testId);
    expect(input.value).toBe(value);
    userEvent.type(input, newValue);
    expect(input.value).toBe(value);
    expect(onChange).toHaveBeenCalledTimes(newValue.length);
  });

  // Omitting SearchField because I don't think we support this use case. If we do, will need to change css a bit
  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
  `('$Name has the proper aria-invalid value and renders a invalid icon if validationState=invalid', ({Component}) => {
    let tree = renderComponent(Component, {validationState: 'invalid'});
    let input = tree.getByTestId(testId);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    if (Component === TextField || Component === TextArea) {
      let invalidIcon = tree.getByRole('img');
      expect(invalidIcon).toBeTruthy();
    }
  });

  // Omitting SearchField because I don't think we support this use case. If we do, will need to change css a bit
  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
  `('$Name has the proper aria-invalid value and renders a valid icon if validationState=valid', ({Component}) => {
    let tree = renderComponent(Component, {validationState: 'valid'});
    let input = tree.getByTestId(testId);
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    if (Component === TextField || Component === TextArea) {
      let validIcon = tree.getByRole('img');
      expect(validIcon).toBeTruthy();
    }
  });

  // Omitting SearchField because I don't think we support this use case. If we do, will need to change css a bit
  // Test fails because aria-invalid only appears if prop.validationState === 'invalid'. Is this bug? Will check with design
  // TODO: Update test to fit new isRequired behavior work in https://jira.corp.adobe.com/browse/RSP-1177
  // Handled in https://github.com/adobe/react-spectrum/pull/477
  it.each`
    Name                | Component        | props
    ${'v3 TextField'}   | ${TextField}     | ${{isRequired: true}}
    ${'v3 TextArea'}    | ${TextArea}      | ${{isRequired: true}}
    ${'v2 TextField'}   | ${V2TextField}   | ${{required: true}}
    ${'v2 TextArea'}    | ${V2TextArea}    | ${{required: true}}
  `('$Name supports a isRequired prop', ({Component, props}) => {
    let tree = renderComponent(Component, props);
    let input = tree.getByTestId(testId);
    expect(input).toHaveAttribute('required');
  });

  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 TextField'}   | ${V2TextField}
    ${'v2 TextArea'}    | ${V2TextArea}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name automatically focuses the input field if autoFocus=true', ({Name, Component}) => {
    let tree = renderComponent(Component, {autoFocus: true, onFocus});
    let input = tree.getByTestId(testId);

    // v2 components seem to focus the entire body, not sure if bug, but functionally is the same
    if (Name.indexOf('v2') !== -1) {
      expect(document.activeElement).toEqual(document.body);
    } else {
      expect(document.activeElement).toEqual(input);
      expect(onFocus).toHaveBeenCalledTimes(1);
    }
  });

  it.each`
    Name                | Component        | props
    ${'v3 TextField'}   | ${TextField}     | ${{isReadOnly: true}}
    ${'v3 TextArea'}    | ${TextArea}      | ${{isReadOnly: true}}
    ${'v3 SearchField'} | ${SearchField}   | ${{isReadOnly: true}}
    ${'v2 TextField'}   | ${V2TextField}   | ${{readOnly: true}}
    ${'v2 TextArea'}    | ${V2TextArea}    | ${{readOnly: true}}
    ${'v2 SearchField'} | ${V2SearchField} | ${{readOnly: true}}
  `('$Name should support isReadOnly', ({Component, props}) => { 
    let tree = renderComponent(Component, props);
    let input = tree.getByTestId(testId);
    expect(input).toHaveAttribute('readonly');
    userEvent.click(input);
    expect(document.activeElement).toEqual(input);

    // Note: simulating text input via fireEvent or "type"(userEvent library) still causes the input value to change
    // Seems like this is a framework issue rather than a bug with TextField so omitting the test case
  });

  it.each`
    Name                | Component        | props
    ${'v3 TextField'}   | ${TextField}     | ${{isDisabled: true}}
    ${'v3 TextArea'}    | ${TextArea}      | ${{isDisabled: true}}
    ${'v3 SearchField'} | ${SearchField}   | ${{isDisabled: true}}
    ${'v2 TextField'}   | ${V2TextField}   | ${{disabled: true}}
    ${'v2 TextArea'}    | ${V2TextArea}    | ${{disabled: true}}
    ${'v2 SearchField'} | ${V2SearchField} | ${{disabled: true}}
  `('$Name should disable the input field if isDisabled=true', ({Component, props}) => { 
    let tree = renderComponent(Component, props);
    let input = tree.getByTestId(testId);
    expect(input).toHaveAttribute('disabled');
    userEvent.click(input);
    expect(document.activeElement).not.toEqual(input);
    // Note: simulating text input via fireEvent or "type"(userEvent library) still causes the input value to change
    // Seems like this is a framework issue rather than a bug with TextField so omitting the test case
  });

  // New v3 feature valid for textfield and textarea only
  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
  `('$Name allow the user to render a custom icon', ({Component}) => { 
    let iconId = 'icon-yo';
    let tree = renderComponent(Component, {icon: <Checkmark data-testid={iconId} />});
    let icon = tree.getByTestId(iconId);
    expect(icon).toHaveAttribute('role', 'img');
  });

  // New v3 functionality, omitting v2 components
  it.each`
    Name                | Component
    ${'v3 TextField'}   | ${TextField}
    ${'v3 TextArea'}    | ${TextArea}
    ${'v3 SearchField'} | ${SearchField}
  `('$Name will attach a ref to the input field if provided as a prop', ({Component}) => {
    let ref = React.createRef();
    let tree = renderComponent(Component, {ref});
    let input = tree.getByTestId(testId);
    expect(ref.current).toEqual(input);
  });
});
