import {FieldError} from '../src/FieldError';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import React from 'react';
import {render} from '@react-spectrum/test-utils-internal';
import {TextField} from '../src/TextField';

describe('FieldError', function () {
  it('supports data attributes passed as props', async () => {
    const TEST_ID = 'testid';

    const {getByTestId} = render(
      <TextField isInvalid>
        <Label>Email</Label>
        <Input />
        <FieldError data-testid={TEST_ID}>An error</FieldError>
      </TextField>
    );

    const element = getByTestId(TEST_ID);
    expect(element).toHaveTextContent('An error');
  });

  it('renders as span by default', async () => {
    const {getByText} = render(
      <TextField isInvalid>
        <Label>Email</Label>
        <Input />
        <FieldError>An error</FieldError>
      </TextField>
    );

    const element = getByText('An error');
    expect(element.tagName).toBe('SPAN');
  });

  it('supports elementType prop', async () => {
    const {getByText} = render(
      <TextField isInvalid>
        <Label>Email</Label>
        <Input />
        <FieldError elementType="div">An error</FieldError>
      </TextField>
    );

    const element = getByText('An error');
    expect(element.tagName).toBe('DIV');
  });

  it('allows block-level children when elementType is div', async () => {
    const {getByRole} = render(
      <TextField isInvalid>
        <Label>Email</Label>
        <Input />
        <FieldError elementType="div">
          <ul>
            <li>Error one</li>
            <li>Error two</li>
          </ul>
        </FieldError>
      </TextField>
    );

    const list = getByRole('list');
    expect(list).toBeInTheDocument();
  });
});
