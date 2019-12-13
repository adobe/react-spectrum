import Asterisk from '@spectrum-icons/ui/Asterisk';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-spectrum/utils';
import intlMessages from '../intl/*.json';
import {mergeProps} from '@react-aria/utils';
import React, {forwardRef} from 'react';
import {SpectrumLabelProps} from '@react-types/label';
import styles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {useLabel} from '@react-aria/label';
import {useMessageFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';

interface LabelBaseProps extends SpectrumLabelProps {
  labelClassName?: string,
  wrapperClassName?: string,
  componentName?: string
}

function LabelBase(props: LabelBaseProps, ref: DOMRef<HTMLLabelElement & HTMLDivElement>) {
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

  props = useProviderProps(props);
  let {
    label,
    children,
    labelClassName,
    wrapperClassName,
    labelFor,
    componentName,
    isRequired,
    necessityIndicator = isRequired != null ? 'icon' : null,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let {styleProps} = useStyleProps(otherProps);

  let formatMessage = useMessageFormatter(intlMessages);
  let necessityLabel = isRequired ? formatMessage('(required)') : formatMessage('(optional)');
  let icon = (
    <Asterisk
      className={classNames(styles, 'spectrum-FieldLabel-requiredIcon')}
      size="S"
      alt={formatMessage('(required)')} />
    );

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
    styles,
    labelClassName
  );

  let fieldLabel = label ? (
    <label
      {...labelAriaProps}
      className={fieldLabelClassName}>
      <span className={classNames(styles, 'spectrum-FieldLabel-label')}>
        {label}
      </span>
      {necessityIndicator && ' '}
      {necessityIndicator === 'label' && <span>{necessityLabel}</span>}
      {necessityIndicator === 'icon' && isRequired && icon}
    </label>
  ) : (
    <div className={fieldLabelClassName} />
  );

  if (childArray.length > 0) {
    if (wrapperClassName) {
      wrapper = (
        <div className={wrapperClassName}>
          {childArray}
        </div>
      );
    }

    return (
      <div {...filterDOMProps(otherProps)} {...styleProps} ref={domRef}>
        {fieldLabel}
        {wrapper || childArray}
      </div>
    );
  }

  return React.cloneElement(
    fieldLabel,
    {
      ref: domRef,
      ...mergeProps(
        fieldLabel.props,
        {...filterDOMProps(otherProps), ...styleProps}
      )
    }
  );
}

let _LabelBase = forwardRef(LabelBase);
export {_LabelBase as LabelBase};
