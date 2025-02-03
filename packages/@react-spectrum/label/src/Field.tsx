/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames, SlotProvider, useStyleProps} from '@react-spectrum/utils';
import {Flex} from '@react-spectrum/layout';
import {HelpText} from './HelpText';
import {Label} from './Label';
import {LabelPosition, RefObject} from '@react-types/shared';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {mergeProps, useId} from '@react-aria/utils';
import React, {ReactNode, Ref} from 'react';
import {SpectrumFieldProps} from '@react-types/label';
import {useFormProps} from '@react-spectrum/form';

export const Field = React.forwardRef(function Field(props: SpectrumFieldProps, ref: Ref<HTMLElement>) {
  let formProps = useFormProps(props);
  let isInForm = formProps !== props;
  props = formProps;
  let {
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    isRequired,
    necessityIndicator,
    includeNecessityIndicatorInAccessibilityName,
    validationState,
    isInvalid,
    description,
    errorMessage = e => e.validationErrors.join(' '),
    validationErrors,
    validationDetails,
    isDisabled,
    showErrorIcon,
    contextualHelp,
    children,
    labelProps = {},
    // Not every component that uses <Field> supports help text.
    descriptionProps = {},
    errorMessageProps = {},
    elementType,
    wrapperClassName,
    wrapperProps = {},
    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let errorMessageString: ReactNode = null;
  if (typeof errorMessage === 'function') {
    errorMessageString = isInvalid != null && validationErrors != null && validationDetails != null
      ? errorMessage({
        isInvalid,
        validationErrors,
        validationDetails
      })
      : null;
  } else {
    errorMessageString = errorMessage;
  }
  let hasHelpText = !!description || errorMessageString && (isInvalid || validationState === 'invalid');
  let contextualHelpId = useId();

  let fallbackLabelPropsId = useId();
  if (label && contextualHelp && !labelProps.id) {
    labelProps.id = fallbackLabelPropsId;
  }

  let labelWrapperClass = classNames(
      labelStyles,
      'spectrum-Field',
    {
      'spectrum-Field--positionTop': labelPosition === 'top',
      'spectrum-Field--positionSide': labelPosition === 'side',
      'spectrum-Field--alignEnd': labelAlign === 'end',
      'spectrum-Field--hasContextualHelp': !!props.contextualHelp
    },
      styleProps.className,
      wrapperClassName
    );

  children = React.cloneElement(children, mergeProps(children.props as any, {
    className: classNames(
        labelStyles,
        'spectrum-Field-field'
      )
  }));

  let renderHelpText = () => (
    <HelpText
      descriptionProps={descriptionProps}
      errorMessageProps={errorMessageProps}
      description={description}
      errorMessage={errorMessageString}
      validationState={validationState}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      showErrorIcon={showErrorIcon}
      gridArea={labelStyles.helpText} />
    );

  let renderChildren = () => {
    if (labelPosition === 'side') {
      return (
        <Flex direction="column" UNSAFE_className={classNames(labelStyles, 'spectrum-Field-wrapper')}>
          {children}
          {hasHelpText && renderHelpText()}
        </Flex>
      );
    }

    return (
      <>
        {children}
        {hasHelpText && renderHelpText()}
      </>
    );
  };

  let labelAndContextualHelp = (
    <>
      {label && (
        <Label
          {...labelProps}
          labelPosition={labelPosition}
          labelAlign={labelAlign}
          isRequired={isRequired}
          necessityIndicator={necessityIndicator}
          includeNecessityIndicatorInAccessibilityName={includeNecessityIndicatorInAccessibilityName}
          elementType={elementType}>
          {label}
        </Label>
      )}
      {label && contextualHelp &&
        <SlotProvider
          slots={{
            actionButton: {
              UNSAFE_className: classNames(labelStyles, 'spectrum-Field-contextualHelp'),
              id: contextualHelpId,
              'aria-labelledby': labelProps?.id ? `${labelProps.id} ${contextualHelpId}` : undefined
            }
          }}>
          {contextualHelp}
        </SlotProvider>
      }
    </>
    );

    // Need to add an extra wrapper for the label and contextual help if labelPosition is side,
    // so that the table layout works inside forms.
  if (isInForm && labelPosition === 'side' && label && contextualHelp) {
    labelAndContextualHelp = (
      <div className={classNames(labelStyles, 'spectrum-Field-labelCell')}>
        <div className={classNames(labelStyles, 'spectrum-Field-labelWrapper')}>
          {labelAndContextualHelp}
        </div>
      </div>
    );
  }

  return (
    (<div
      {...styleProps}
      {...wrapperProps}
      ref={ref as RefObject<HTMLDivElement | null>}
      className={labelWrapperClass}>
      {labelAndContextualHelp}
      {renderChildren()}
    </div>)
  );
});
