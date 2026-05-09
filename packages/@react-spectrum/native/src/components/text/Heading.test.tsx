import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Heading} from './Heading';

describe('Heading', () => {
  it('renders with header accessibility role', () => {
    let {getByTestId} = renderWithProvider(<Heading testID="h">Title</Heading>);
    expect(getByTestId('h').props.accessibilityRole).toBe('header');
  });

  it('renders children', () => {
    let {getByTestId} = renderWithProvider(<Heading testID="h">Title</Heading>);
    expect(getByTestId('h').props.children).toBe('Title');
  });
});
