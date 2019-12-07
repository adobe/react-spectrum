import {cleanup, render, within} from '@testing-library/react';
import * as createId from '@react/react-spectrum/utils/createId';
import {FieldLabel} from '../';
import React from 'react';
import * as useId from '@react-aria/utils/src/useId';
import V2FieldLabel from '@react/react-spectrum/FieldLabel';

describe('FieldLabel', () => {
  let label = 'hi';
  let labelFor = 'blah';
  let id = 'test-id';
  let datatestid = 'FieldLabel';
  let useIdMock, createIdMock;

  function renderFieldLabel(FieldLabelComponent, props, numChildren, rerender) {
    let component = (
      <FieldLabelComponent data-testid={datatestid} {...props} >
        {numChildren > 0 && <button data-testid="testbutton">test child</button>}
        {numChildren > 1 && <button data-testid="testbutton2">test child2</button>}
      </FieldLabelComponent>
    );
    return rerender ? rerender(component) : render(component);
  }

  function findLabel() {
    return document.querySelector('label');
  }

  beforeAll(() => {
    useIdMock = jest.spyOn(useId, 'useId').mockImplementation(() => id);
    createIdMock = jest.spyOn(createId, 'default').mockImplementation(() => id);
  });

  afterAll(() => {
    useIdMock.mockRestore();
    createIdMock.mockRestore();
  });

  afterEach(() => {
    cleanup();
  });

  describe('with label', () => {
    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
      ${'v2 FieldLabel no children'}       | ${V2FieldLabel} | ${0}
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}
      ${'v2 FieldLabel one child'}         | ${V2FieldLabel} | ${1}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
      ${'v2 FieldLabel multiple children'} | ${V2FieldLabel} | ${2}
    `('$Name should render a label if provided', ({Component, numChildren}) => {
      renderFieldLabel(Component, {label, labelFor}, numChildren);
      let fieldLabel = findLabel();
      expect(fieldLabel).toBeTruthy();
      expect(fieldLabel).toHaveAttribute('for', labelFor);
      expect(fieldLabel).toHaveAttribute('id', id);
      expect(within(fieldLabel).getByText(label)).toBeTruthy();
    });

    // removing the v2 tests until rsp 2.26 is published and role is available on the svg
    // ${'v2 FieldLabel multiple children'} | ${V2FieldLabel} | ${2}        | ${{necessity: 'required', necessityIndicator: 'icon'}}
    it.each`
      Name                                 | Component       | numChildren | props
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}        | ${{isRequired: true, necessityIndicator: 'icon'}}
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}        | ${{isRequired: true, necessityIndicator: 'icon'}}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}        | ${{isRequired: true, necessityIndicator: 'icon'}}
    `('$Name will show an asterix when required with icon indicator', ({Component, numChildren, props}) => {
      renderFieldLabel(Component, {label, labelFor, ...props}, numChildren);
      let fieldLabel = findLabel();
      expect(within(fieldLabel).getByRole('presentation')).toBeTruthy();
    });

    // Forwarding ref is v3 specific
    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
    `('$Name should attach the user provided ref to the label', ({Component, numChildren}) => {
      let ref = React.createRef();
      renderFieldLabel(Component, {label, labelFor, ref}, numChildren);
      let fieldLabel = findLabel();
      expect(fieldLabel).toBe(ref.current.UNSAFE_getDOMNode());
    });

    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
    `('$Name should attach the user provided ref to the div', ({Component, numChildren}) => {
      let ref = React.createRef();
      let tree = renderFieldLabel(Component, {label, labelFor, ref}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel).toBe(ref.current.UNSAFE_getDOMNode());
    });

    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
      ${'v2 FieldLabel no children'}       | ${V2FieldLabel} | ${0}
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}
      ${'v2 FieldLabel one child'}         | ${V2FieldLabel} | ${1}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
      ${'v2 FieldLabel multiple children'} | ${V2FieldLabel} | ${2}
    `('$Name should allow for additional dom props', ({Component, numChildren}) => {
      let tree = renderFieldLabel(Component, {label, labelFor, 'data-foo': 'bar'}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel).toHaveAttribute('data-foo', 'bar');
    });

    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
      ${'v2 FieldLabel no children'}       | ${V2FieldLabel} | ${0}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
      ${'v2 FieldLabel multiple children'} | ${V2FieldLabel} | ${2}
    `('$Name should warn if labelFor is missing', ({Component, children}) => {
      let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      renderFieldLabel(Component, {label}, children);
      expect(spyWarn).toHaveBeenCalledWith(`Missing labelFor attribute on FieldLabel with label "${label}"`);
    });
  });

  describe('without label', () => {
    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
      ${'v2 FieldLabel no children'}       | ${V2FieldLabel} | ${0}
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}
      ${'v2 FieldLabel one child'}         | ${V2FieldLabel} | ${1}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
      ${'v2 FieldLabel multiple children'} | ${V2FieldLabel} | ${2}
    `('$Name should render a div if label wasn\'t provided', ({Name, Component, numChildren}) => {
      let spyError;
      if (Name === 'v2 FieldLabel no children') {
        spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
      }
      let tree = renderFieldLabel(Component, {labelFor}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel.tagName.toLowerCase()).toBe('div');
      expect(fieldLabel).not.toHaveAttribute('for');
      expect(fieldLabel).not.toHaveAttribute('id');
      if (Name === 'v2 FieldLabel no children') {
        expect(spyError).toHaveBeenCalled();
      }
    });

    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
    `('$Name should attach the user provided ref to the div', ({Component, numChildren}) => {
      let ref = React.createRef();
      let tree = renderFieldLabel(Component, {labelFor, ref}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel).toBe(ref.current.UNSAFE_getDOMNode());
    });

    it.each`
      Name                                 | Component       | numChildren
      ${'v3 FieldLabel no children'}       | ${FieldLabel}   | ${0}
      ${'v2 FieldLabel no children'}       | ${V2FieldLabel} | ${0}
      ${'v3 FieldLabel one child'}         | ${FieldLabel}   | ${1}
      ${'v2 FieldLabel one child'}         | ${V2FieldLabel} | ${1}
      ${'v3 FieldLabel multiple children'} | ${FieldLabel}   | ${2}
      ${'v2 FieldLabel multiple children'} | ${V2FieldLabel} | ${2}
    `('$Name should allow for additional dom props', ({Component, numChildren}) => {
      let tree = renderFieldLabel(Component, {labelFor, 'data-foo': 'foo'}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel).toHaveAttribute('data-foo', 'foo');
    });
  });

  describe('with 1 child', () => {
    it.each`
      Name               | Component
      ${'v3 FieldLabel'} | ${FieldLabel}
      ${'v2 FieldLabel'} | ${V2FieldLabel}
    `('$Name should render with a wrapping div with autogenerated child id and for', ({Component}) => {
      useIdMock.mockReturnValueOnce('first');
      useIdMock.mockReturnValueOnce('second');
      createIdMock.mockReturnValueOnce('first');
      createIdMock.mockReturnValueOnce('second');

      let tree = renderFieldLabel(Component, {label}, 1);
      let fieldLabel = findLabel();
      expect(fieldLabel).toBeTruthy();
      expect(fieldLabel).toHaveAttribute('for', 'second');
      expect(fieldLabel).toHaveAttribute('id', 'first');

      let button = tree.getByRole('button');
      expect(button).toHaveAttribute('id', 'second');
      expect(button).toHaveAttribute('aria-labelledby', 'first');
    });

    it.each`
      Name               | Component
      ${'v3 FieldLabel'} | ${FieldLabel}
      ${'v2 FieldLabel'} | ${V2FieldLabel}
    `('$Name shouldn\'t generate a console warning for missing labelFor prop', ({Component}) => {
      let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      renderFieldLabel(Component, {label}, 1);
      expect(spyWarn).not.toHaveBeenCalled();
    });
  });

  describe('with more than 1 child', () => {
    it.each`
      Name               | Component
      ${'v3 FieldLabel'} | ${FieldLabel}
      ${'v2 FieldLabel'} | ${V2FieldLabel}
    `('$Name should render with a wrapping div with no autogenerated child props', ({Component}) => {
      useIdMock.mockReturnValueOnce('first');
      useIdMock.mockReturnValueOnce('second');
      createIdMock.mockReturnValueOnce('first');
      createIdMock.mockReturnValueOnce('second');

      let {getAllByRole, getByRole, getByTestId, rerender} = renderFieldLabel(Component, {label, labelFor}, 2);
      let fieldLabel = findLabel();
      expect(fieldLabel).toBeTruthy();
      expect(fieldLabel).toHaveAttribute('for', labelFor);
      expect(fieldLabel).toHaveAttribute('id', 'first');

      let fieldset;
      if (Component === FieldLabel) {
        fieldset = getByRole('group');
        expect(fieldset).toBeTruthy();
        expect(fieldset).not.toHaveAttribute('id');
        expect(fieldset).toHaveAttribute('aria-labelledby', fieldLabel.id);
      }

      let firstButton = getAllByRole('button')[0];
      expect(firstButton).toBeTruthy();
      expect(firstButton).not.toHaveAttribute('id');
      expect(firstButton).not.toHaveAttribute('aria-labelledby');

      let secondButton = getAllByRole('button')[1];
      expect(secondButton).not.toHaveAttribute('id');
      expect(secondButton).not.toHaveAttribute('aria-labelledby');

      // with no label, render wrapping div with no role and no aria-labelledby
      renderFieldLabel(Component, {labelFor}, 2, rerender);
      if (Component === FieldLabel) {
        fieldset = getByTestId(datatestid);
        expect(fieldset).not.toHaveAttribute('role');
        expect(fieldset).not.toHaveAttribute('aria-labelledby');

        fieldLabel = fieldset.firstElementChild;
        expect(fieldLabel.tagName.toLowerCase()).toBe('div');
        expect(fieldLabel).not.toHaveAttribute('for');
        expect(fieldLabel).not.toHaveAttribute('id');
      }
    });
  });
});
