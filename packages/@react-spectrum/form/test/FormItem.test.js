import _3DMaterials from '@spectrum-icons/workflow/3DMaterials';
import {cleanup, render, within} from '@testing-library/react';
import * as createId from '@react/react-spectrum/utils/createId';
import {FormItem} from '../';
import React from 'react';
import _3DMaterials from '@spectrum-icons/workflow/3DMaterials';
import * as useId from '@react-aria/utils/src/useId';
import {FormItem as V2FormItem} from '@react/react-spectrum/Form';

describe('FormItem', () => {
  let label = 'hi';
  let labelFor = 'blah';
  let id = 'test-id';
  let datatestid = 'formItem';
  let useIdMock, createIdMock;

  function renderFormItem(FormItemComponent, props, numChildren) {
    let component = (
      <FormItemComponent data-testid={datatestid} {...props} >
        {numChildren > 0 && <button data-testid="testbutton">test child</button>}
        {numChildren > 1 && <button data-testid="testbutton2">test child2</button>}
      </FormItemComponent>
    );
    return render(component);
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
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v2 FormItem one child'}         | ${V2FormItem} | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name should render a label if provided', ({Component, numChildren}) => {
      let tree = renderFormItem(Component, {label, labelFor}, numChildren);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toBeTruthy();
      expect(fieldLabel).toHaveAttribute('for', labelFor);
      expect(fieldLabel).toHaveAttribute('id', id);
    });

    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v2 FormItem one child'}         | ${V2FormItem} | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name supports an icon with the label if provided', ({Component, numChildren}) => {
      let tree = renderFormItem(Component, {label, labelFor, icon: <_3DMaterials />}, numChildren);
      let fieldLabel = tree.getByText(label);
      expect(within(fieldLabel).getByRole('img')).toBeTruthy();
    });

    // Forwarding ref is v3 specific
    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
    `('$Name should attach the user provided ref to the label', ({Component, numChildren}) => {
      let ref = React.createRef();
      let tree = renderFormItem(Component, {label, labelFor, ref}, numChildren);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toBe(ref.current);
    });

    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v2 FormItem one child'}         | ${V2FormItem} | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name should allow for additional dom props', ({Component, numChildren}) => {
      let tree = renderFormItem(Component, {label, labelFor, disabled: true}, numChildren);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toHaveAttribute('disabled', '');
    });

    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name should warn if labelFor is missing', ({Component, children}) => {
      let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      renderFormItem(Component, {label}, children);
      expect(spyWarn).toHaveBeenCalledWith(`Missing labelFor attribute on FormItem with label "${label}"`);
    });
  });

  describe('without label', () => {
    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v2 FormItem one child'}         | ${V2FormItem} | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name should render a div if label wasn\'t provided', ({Component, numChildren}) => {
      let tree = renderFormItem(Component, {labelFor}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel.tagName.toLowerCase()).toBe('div');
      expect(fieldLabel).not.toHaveAttribute('for');
      expect(fieldLabel).not.toHaveAttribute('id');
    });

    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v2 FormItem one child'}         | ${V2FormItem} | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name doesn\'t support an icon if label isn\'t provided', ({Component, numChildren}) => {
      let tree = renderFormItem(Component, {labelFor, icon: <_3DMaterials />}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(within(fieldLabel).queryByRole('img')).toBeFalsy();
    });

    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
    `('$Name should attach the user provided ref to the div', ({Component, numChildren}) => {
      let ref = React.createRef();
      let tree = renderFormItem(Component, {labelFor, ref}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel).toBe(ref.current);
    });

    it.each`
      Name                               | Component     | numChildren
      ${'v3 FormItem no children'}       | ${FormItem}   | ${0}
      ${'v2 FormItem no children'}       | ${V2FormItem} | ${0}
      ${'v3 FormItem one child'}         | ${FormItem}   | ${1}
      ${'v2 FormItem one child'}         | ${V2FormItem} | ${1}
      ${'v3 FormItem multiple children'} | ${FormItem}   | ${2}
      ${'v2 FormItem multiple children'} | ${V2FormItem} | ${2}
    `('$Name should allow for additional dom props', ({Component, numChildren}) => {
      let tree = renderFormItem(Component, {labelFor, disabled: true}, numChildren);
      let fieldLabel = tree.getByTestId(datatestid);
      expect(fieldLabel).toHaveAttribute('disabled', '');
    });
  });

  describe('with no children', () => {
    it.each`
      Name             | Component     | label
      ${'v3 FormItem'} | ${FormItem}   | ${label}
      ${'v2 FormItem'} | ${V2FormItem} | ${label}
      ${'v3 FormItem'} | ${FormItem}   | ${null}
      ${'v2 FormItem'} | ${V2FormItem} | ${null}
    `('$Name should combine the provided class name and labelClassName', ({Component}) => {
      let tree = renderFormItem(Component, {label, labelFor, className: 'testClass', labelClassName: 'labelClass'}, 0);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toHaveAttribute('class', expect.stringContaining('testClass'));
      expect(fieldLabel).toHaveAttribute('class', expect.stringContaining('labelClass'));
    });
  });

  describe('with 1 child', () => {
    it.each`
      Name             | Component
      ${'v3 FormItem'} | ${FormItem}
      ${'v2 FormItem'} | ${V2FormItem}
    `('$Name should render with autogenerated child id and for', ({Component}) => {
      useIdMock.mockReturnValueOnce('first');
      useIdMock.mockReturnValueOnce('second');
      createIdMock.mockReturnValueOnce('first');
      createIdMock.mockReturnValueOnce('second');

      let tree = renderFormItem(Component, {label}, 1);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toBeTruthy();
      expect(fieldLabel).toHaveAttribute('for', 'second');
      expect(fieldLabel).toHaveAttribute('id', 'first');

      let button = tree.getByTestId('testbutton');
      expect(button).toHaveAttribute('id', 'second');
      expect(button).toHaveAttribute('aria-labelledby', 'first');
    });

    it.each`
      Name             | Component
      ${'v3 FormItem'} | ${FormItem}
      ${'v2 FormItem'} | ${V2FormItem}
    `('$Name shouldn\'t generate a console warning for missing labelFor prop', ({Component}) => {
      let spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      renderFormItem(Component, {label}, 1);
      expect(spyWarn).not.toHaveBeenCalled();
    });

    it.each`
      Name             | Component
      ${'v3 FormItem'} | ${FormItem}
      ${'v2 FormItem'} | ${V2FormItem}
    `('$Name shouldn\'t combine the provided class name and labelClassName', ({Component}) => {
      let tree = renderFormItem(Component, {label, className: 'testClass', labelClassName: 'labelClass'}, 1);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toHaveAttribute('class', expect.not.stringContaining('testClass'));
      expect(fieldLabel).toHaveAttribute('class', expect.stringContaining('labelClass'));
    });
  });

  describe('with more than 1 child', () => {
    it.each`
      Name             | Component
      ${'v3 FormItem'} | ${FormItem}
      ${'v2 FormItem'} | ${V2FormItem}
    `('$Name should render with no autogenerated child props', ({Component}) => {
      useIdMock.mockReturnValueOnce('first');
      useIdMock.mockReturnValueOnce('second');
      createIdMock.mockReturnValueOnce('first');
      createIdMock.mockReturnValueOnce('second');

      let tree = renderFormItem(Component, {label, labelFor}, 2);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toBeTruthy();
      expect(fieldLabel).toHaveAttribute('for', labelFor);
      expect(fieldLabel).toHaveAttribute('id', 'first');

      let firstButton = tree.getByTestId('testbutton');
      expect(firstButton).toBeTruthy();
      expect(firstButton).not.toHaveAttribute('id');
      expect(firstButton).not.toHaveAttribute('aria-labelledby');

      let secondButton = tree.getByTestId('testbutton2');
      expect(secondButton).not.toHaveAttribute('id');
      expect(secondButton).not.toHaveAttribute('aria-labelledby');
    });

    it.each`
      Name             | Component
      ${'v3 FormItem'} | ${FormItem}
      ${'v2 FormItem'} | ${V2FormItem}
    `('$Name shouldn\'t combine the provided class name and labelClassName', ({Component}) => {
      let tree = renderFormItem(Component, {label, className: 'testClass', labelClassName: 'labelClass'}, 2);
      let fieldLabel = tree.getByText(label);
      expect(fieldLabel).toHaveAttribute('class', expect.not.stringContaining('testClass'));
      expect(fieldLabel).toHaveAttribute('class', expect.stringContaining('labelClass'));
    });
  });
});
