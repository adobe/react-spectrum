import {Button} from './Button';
import React from 'react';
import {render} from '@testing-library/react';

describe('Button', () => {
  it('should render successfully', () => {
    const {baseElement} = render(<Button>Press me</Button>);
    expect(baseElement).toBeTruthy();
  });
});
