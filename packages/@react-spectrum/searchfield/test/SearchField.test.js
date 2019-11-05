import Checkmark from '@spectrum-icons/workflow/Checkmark';
import {cleanup, fireEvent, render, within} from '@testing-library/react';
import React from 'react';
import {SearchField} from '../';
import {triggerPress} from '@react-spectrum/button/test/utils'; // TODO: Move this util funct to test-utils folder (https://github.com/adobe/react-spectrum/pull/491)
import userEvent from '@testing-library/user-event';
import V2SearchField from '@react/react-spectrum/Search';

let testId = 'test-id';
let inputText = 'blah';

function renderComponent(Component, props) {
  return render(<Component {...props} data-testid={testId} />);
}

// Note: Running this test suite will result in some warnings of the following class:
// 1. "Textfield contains an input of type search with both value and defaultValue props.  This is a v2 SearchField issue
// 2. "An update to ForwardRef inside a test was not wrapped in act(...)". See https://github.com/testing-library/react-testing-library/issues/281
// 3. Various warnings about componentWillReceiveProps and componentDidUpdate. Prob a TODO to update v2 components so we don't use these renamed/deprecated lifecycle methods

describe('Search', () => {
  let onChange = jest.fn();
  let onFocus = jest.fn();
  let onSubmit = jest.fn();
  let onClear = jest.fn();

  afterEach(() => {
    onChange.mockClear();
    onFocus.mockClear();
    onSubmit.mockClear();
    onClear.mockClear();
    cleanup();
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name default behavior check', ({Component}) => {
    let tree = renderComponent(Component);
    let outerDiv = tree.container;
    expect(outerDiv).toBeTruthy();

    let input = within(outerDiv).getByTestId(testId);
    expect(input).toHaveAttribute('type', 'search');

    let clearButton = within(outerDiv).queryByRole('button');
    expect(clearButton).toBeNull();
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name supports overriding role and type of search input', ({Component}) => {
    let tree = renderComponent(Component, {role: 'menuitem'});
    let outerDiv = tree.getByRole('menuitem');
    expect(outerDiv).toBeTruthy();

    expect(tree.queryByRole('search')).toBeNull();
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name should support custom icons', ({Component}) => {
    let icon = <Checkmark data-testid="testicon" />;
    let tree = renderComponent(Component, {icon});
    expect(tree.getByTestId('testicon')).toBeTruthy();
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name should support no icons', ({Component}) => {
    let tree = renderComponent(Component, {icon: ''});
    expect(tree.queryByTestId('searchicon')).toBeNull();
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name should display the clear button icon only if text is present', ({Component}) => {
    let tree = renderComponent(Component, {defaultValue: inputText});
    let clearButton = tree.getByLabelText('Clear search');
    expect(clearButton).toBeTruthy();

    let input = tree.getByTestId(testId);
    fireEvent.change(input, {target: {value: ''}});
    clearButton = tree.queryByLabelText('Clear search');
    expect(clearButton).toBeNull();

    userEvent.type(input, 'bleh');
    clearButton = tree.queryByLabelText('Clear search');
    expect(clearButton).toBeTruthy();
  });

  // Omitting v2 searchfield because fireEvent.keyDown seems bugged, doesn't actually propagate the key code
  // which v2 searchfield handleTextKeyDown relies on
  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
  `('$Name submits the textfield value when enter is pressed', ({Component}) => {
    let tree = renderComponent(Component, {defaultValue: inputText, onSubmit});
    let input = tree.getByTestId(testId);
    fireEvent.keyDown(input, {key: 'Enter', code: 13, charCode: 13});
    expect(onSubmit).toBeCalledTimes(1);
    expect(onSubmit).toHaveBeenLastCalledWith(inputText);

    fireEvent.change(input, {target: {value: ''}});
    fireEvent.keyDown(input, {key: 'Enter', code: 13, charCode: 13});
    expect(onSubmit).toBeCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith('');
  });

  // Omitting v2 searchfield because fireEvent.keyDown seems bugged, doesn't actually propagate the key code
  // which v2 searchfield handleTextKeyDown relies on
  it.each`
    Name                | Component        | props
    ${'v3 SearchField'} | ${SearchField}   | ${{isDisabled: true}}
  `('$Name doesn\'t submits the textfield value when enter is pressed but field is disabled', ({Component, props}) => {
    let tree = renderComponent(Component, {defaultValue: inputText, onSubmit, ...props});
    let input = tree.getByTestId(testId);
    fireEvent.keyDown(input, {key: 'Enter', code: 13, charCode: 13});
    expect(onSubmit).toBeCalledTimes(0);
  });

  // Omitting v2 searchfield because fireEvent.keyDown seems bugged, doesn't actually propagate the key code
  // which v2 searchfield handleTextKeyDown relies on
  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
  `('$Name clears the input field if the escape key is pressed and the field is uncontrolled', ({Component}) => {
    let tree = renderComponent(Component, {defaultValue: inputText, onChange, onClear});
    let input = tree.getByTestId(testId);
    expect(input.value).toBe(inputText);
    fireEvent.keyDown(input, {key: 'Escape', code: 27, charCode: 27});
    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('', expect.anything());
    expect(input.value).toBe('');
    expect(document.activeElement).toBe(document.body);

    // onClear was added in v3
    if (Component === SearchField) {
      expect(onClear).toBeCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), expect.anything());
    }
  });

  // Omitting v2 searchfield because fireEvent.keyDown seems bugged, doesn't actually propagate the key code
  // which v2 searchfield handleTextKeyDown relies on
  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
  `('$Name doesn\'t clear the input field if the escape key is pressed and the field is controlled', ({Component}) => {
    let tree = renderComponent(Component, {value: inputText, onChange, onClear});
    let input = tree.getByTestId(testId);
    expect(input.value).toBe(inputText);
    fireEvent.keyDown(input, {key: 'Escape', code: 27, charCode: 27});
    expect(onChange).toBeCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith('', expect.anything());
    expect(input.value).toBe(inputText);
    expect(document.activeElement).toBe(document.body);

    // onClear was added in v3
    expect(onClear).toBeCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(expect.anything(), expect.anything());
  });

  // Omitting v2 searchfield because fireEvent.keyDown seems bugged, doesn't actually propagate the key code
  // which v2 searchfield handleTextKeyDown relies on
  it.each`
    Name                | Component        | props
    ${'v3 SearchField'} | ${SearchField}   | ${{isDisabled: true}}
  `('$Name doesn\'t clear the input field if the escape key is pressed and the field is disabled', ({Component, props}) => {
    let tree = renderComponent(Component, {defaultValue: inputText, onChange, onClear, ...props});
    let input = tree.getByTestId(testId);
    expect(input.value).toBe(inputText);
    fireEvent.keyDown(input, {key: 'Escape', code: 27, charCode: 27});
    expect(onChange).toBeCalledTimes(0);
    expect(input.value).toBe(inputText);

    // onClear was added in v3
    expect(onClear).toBeCalledTimes(0);
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name clears the input field if the clear button is pressed and the field is uncontrolled', ({Component}) => {
    let tree = renderComponent(Component, {defaultValue: inputText, onChange, onClear});
    let input = tree.getByTestId(testId);
    let clearButton = tree.getByLabelText('Clear search');
    expect(input.value).toBe(inputText);
    triggerPress(clearButton);
    expect(onChange).toBeCalledTimes(1);

    if (Component === SearchField) {
      expect(onChange).toHaveBeenLastCalledWith('', expect.anything());
    } else {
      expect(onChange).toHaveBeenLastCalledWith('', expect.anything(), {'from': 'clearButton'});
    }

    expect(input.value).toBe('');
    expect(document.activeElement).toBe(input);

    // onClear was added in v3
    if (Component === SearchField) {
      expect(onClear).toBeCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), expect.anything());
    }
  });

  it.each`
    Name                | Component
    ${'v3 SearchField'} | ${SearchField}
    ${'v2 SearchField'} | ${V2SearchField}
  `('$Name doesn\'t clear the input field if the clear button is pressed and the field is controlled', ({Component}) => {
    let tree = renderComponent(Component, {value: inputText, onChange, onClear});
    let input = tree.getByTestId(testId);
    let clearButton = tree.getByLabelText('Clear search');
    expect(input.value).toBe(inputText);
    userEvent.click(clearButton);
    expect(onChange).toBeCalledTimes(1);

    if (Component === SearchField) {
      expect(onChange).toHaveBeenLastCalledWith('', expect.anything());
    } else {
      expect(onChange).toHaveBeenLastCalledWith('', expect.anything(), {'from': 'clearButton'});
    }

    expect(input.value).toBe(inputText);
    expect(document.activeElement).toBe(input);

    // onClear was added in v3
    if (Component === SearchField) {
      expect(onClear).toBeCalledTimes(1);
      expect(onChange).toHaveBeenLastCalledWith(expect.anything(), expect.anything());
    }
  });

  it.each`
    Name                | Component        | props
    ${'v3 SearchField'} | ${SearchField}   | ${{isDisabled: true}}
    ${'v2 SearchField'} | ${V2SearchField} | ${{disabled: true}}
  `('$Name doesn\'t clear the input field if the clear button is pressed and the field is disabled', ({Component, props}) => {
    let tree = renderComponent(Component, {defaultValue: inputText, onChange, onClear, ...props});
    let input = tree.getByTestId(testId);
    let clearButton = tree.getByLabelText('Clear search');
    expect(input.value).toBe(inputText);
    userEvent.click(clearButton);
    expect(onChange).toBeCalledTimes(0);
    expect(input.value).toBe(inputText);

    // onClear was added in v3
    if (Component === SearchField) {
      expect(onClear).toBeCalledTimes(0);
    }
  });
});
