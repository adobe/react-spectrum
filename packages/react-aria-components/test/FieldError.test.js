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
});
