import classNames from 'classnames';
import {filterDOMProps} from '@react-spectrum/utils';
import {LabelProps} from '@react-types/label';
import React, {forwardRef, ReactNode, RefObject} from 'react';
import {useLabel} from '@react-aria/label';

interface SpectrumLabelBaseProps extends LabelProps {
  labelClassName: string,
  wrapperClassName: string,
  componentName: string,
  icon?: ReactNode 
}

export const LabelBase = forwardRef((props: SpectrumLabelBaseProps, ref: RefObject<HTMLDivElement> & RefObject<HTMLLabelElement>) => {
  /*
  There are 3 cases:
  1. No children - only render the <label>, no wrapping div. `labelFor` required.
  Result: <label for="content">Label</label>
  
  2. 1 child - render wrapping <div>. Automatically generate child `id` and label `for` attributes.
  Result: 
    <label id="labelIdGenerated" for="contentIdGenerated">Label</label>
    <div>
      <input id="contentIdGenerated" aria-labelledby="labelIdGenerated" />
    </div>

  3. > 1 children - render wrapping <div>. `labelFor` required, along with `id` on child.
  Result:
    <label id="labelIdGenerated" for="input1">Label</label>
    <div>
      <input id="input1" />
      <input id="input2" />
    </div>
  */
  
  let {    
    label,
    children,
    className,
    labelClassName,
    wrapperClassName,
    labelFor,
    componentName,
    icon,
    ...otherProps
  } = props;

  let wrapper;
  let childArray = React.Children.toArray(children);
  let labelledComponentProps;
  if (childArray.length === 1) {
    labelledComponentProps = childArray[0].props;
  }

  let {labelAriaProps, labelledComponentAriaProps} = useLabel(props, labelledComponentProps);

  // Only apply the generated aria props to child if there is a label
  if (childArray.length === 1 && label) {
    childArray[0] = React.cloneElement(
      childArray[0],
      labelledComponentAriaProps
    );
  }

  if (!labelFor && childArray.length !== 1) {
    console.warn(`Missing labelFor attribute on ${componentName} with label "${label}"`);
  }
  
  let fieldLabelClassName = classNames(
    labelClassName,
    childArray.length === 0 ? className : null
  );

  let fieldLabel = label ? (
    <label
      {...filterDOMProps(otherProps)}
      className={fieldLabelClassName}
      {...labelAriaProps}
      ref={ref}>
      {label}
      {icon && ' '}
      {icon}
    </label>
  ) : (
    <div
      className={fieldLabelClassName}
      {...filterDOMProps(otherProps)}
      ref={ref} />
  );
  
  if (childArray.length > 0) {
    if (wrapperClassName) {
      wrapper = (
        <div data-testid="wrapperId" className={wrapperClassName}>
          {childArray}
        </div>
      );
    }

    return (
      <div className={className}>
        {fieldLabel}
        {wrapper || childArray}
      </div>
    );
  }

  return fieldLabel;
});
