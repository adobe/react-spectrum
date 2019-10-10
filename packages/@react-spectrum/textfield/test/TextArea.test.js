import {cleanup, fireEvent, render} from '@testing-library/react';
import React from 'react';
import {TextArea} from '../';
import V2TextArea from '@react/react-spectrum/Textarea';

let testId = 'test-id';
let mockScrollHeight = 500;

function renderComponent(Component, props) {
  return render(<Component {...props} data-testid={testId} />);
}

describe('TextArea', () => {
  let onChange = jest.fn();
  let oldScrollHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight');

  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {configurable: true, value: mockScrollHeight});
  });

  afterAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', oldScrollHeight);
  });

  afterEach(() => {
    onChange.mockClear();
    cleanup();
  }); 

  // The quiet variant of the textarea doesn't have a internal vertical scroller when the 
  // user inputs more than two lines of text. To workaround this on user text input the height style of the textarea is set to 
  // "auto" to get the scroller to appear, then the height is set equal to scrollHeight to remove the scroller
  // and properly adjust the height of the textarea to match the currently input text
  it.each`
    Name                | Component        | props
    ${'v3 TextArea'}    | ${TextArea}      | ${{isQuiet: true, onChange}}
    ${'v2 TextArea'}    | ${V2TextArea}    | ${{quiet: true, onChange}}
  `('$Name quiet variant automatically adjusts its vertical height on change', ({Component, props}) => {  
    let tree = renderComponent(Component, props);
    let input = tree.getByTestId(testId);
  
    expect(input.style.height).toBe('');
    fireEvent.change(input, {target: {value: '15', style: {}}});
    expect(input.style.height).toBe(`${mockScrollHeight}px`);
  });
});
