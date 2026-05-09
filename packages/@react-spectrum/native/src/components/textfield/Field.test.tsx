import React from 'react';
import {renderWithProvider} from '../../test-utils/renderWithProvider';
import {Field} from './Field';

describe('Field', () => {
  it('renders label text', () => {
    let {root} = renderWithProvider(
      <Field label="Email">
        <></>
      </Field>
    );
    let labelNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Email'
    )[0];
    expect(labelNode).toBeDefined();
  });

  it('renders error message when invalid', () => {
    let {root} = renderWithProvider(
      <Field errorMessage="Bad input" label="Email" validationState="invalid">
        <></>
      </Field>
    );
    let errorNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Bad input'
    )[0];
    expect(errorNode).toBeDefined();
  });

  it('renders description when not invalid', () => {
    let {root} = renderWithProvider(
      <Field description="Help text" label="Email">
        <></>
      </Field>
    );
    let descNode = root.findAll(
      n => typeof n.type === 'string' && (n.props as any).children === 'Help text'
    )[0];
    expect(descNode).toBeDefined();
  });
});
