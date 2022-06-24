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

import {classNames, useStyleProps} from '@react-spectrum/utils';
import {Flex} from '@react-spectrum/layout';
import {FocusRing} from '@react-aria/focus'; 
import {HelpText} from './HelpText';
import {Label} from './Label';
import {LabelPosition} from '@react-types/shared';
import labelStyles from '@adobe/spectrum-css-temp/components/fieldlabel/vars.css';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import React, {RefObject} from 'react';
import {SpectrumFieldProps} from '@react-types/label';
import styles from '@adobe/spectrum-css-temp/components/textfield/vars.css'; 
import {useFormProps} from '@react-spectrum/form';
import {useHover} from '@react-aria/interactions';

function Field(props: SpectrumFieldProps, ref: RefObject<HTMLElement>) {
  props = useFormProps(props);
  let {
    label,
    labelPosition = 'top' as LabelPosition,
    labelAlign,
    isRequired,
    necessityIndicator,
    includeNecessityIndicatorInAccessibilityName,
    validationState,
    description,
    errorMessage,
    isDisabled,
    showErrorIcon,
    children,
    labelProps,
    readOnlyText,
    isReadOnly,
    multiLine,
    inputProps, 
    autoFocus,
    inputRef, 
    // wrapperChildren,
    // Not every component that uses <Field> supports help text.
    descriptionProps = {},
    errorMessageProps = {},
    elementType,
    wrapperClassName,

    ...otherProps
  } = props;
  let {styleProps} = useStyleProps(otherProps);
  let hasHelpText = !!description || errorMessage && validationState === 'invalid';
  let {hoverProps, isHovered} = useHover({isDisabled});


  if (label || hasHelpText) {
    let labelWrapperClass = classNames(
      labelStyles,
      'spectrum-Field',
      {
        'spectrum-Field--positionTop': labelPosition === 'top',
        'spectrum-Field--positionSide': labelPosition === 'side'
      },
      styleProps.className,
      wrapperClassName
    );

    children = React.cloneElement(children, mergeProps(children.props, {
      className: classNames(
        labelStyles,
        'spectrum-Field-field'
      )
    }));

    // render input element with readonly string (don't render children?)

    let renderHelpText = () => (
      <HelpText
        descriptionProps={descriptionProps}
        errorMessageProps={errorMessageProps}
        description={description}
        errorMessage={errorMessage}
        validationState={validationState}
        isDisabled={isDisabled}
        showErrorIcon={showErrorIcon} />
    );

    let renderChildren = () => (
      <Flex direction="column" UNSAFE_className={classNames(labelStyles, 'spectrum-Field-wrapper')}>
        {children}
        {hasHelpText && renderHelpText()}
      </Flex>
    );


    let ElementType: React.ElementType = multiLine ? 'textarea' : 'input';
    
    if (isReadOnly && readOnlyText || readOnlyText === '') {

      if (readOnlyText === '') {
        readOnlyText = '(None)';
      }

      renderChildren = () => (
        <Flex direction="column" UNSAFE_className={classNames(labelStyles, 'spectrum-Field-wrapper')}>
          <div
            className={
              classNames(
                styles,
                'spectrum-Textfield',
                {
                  'spectrum-Textfield--readonly': isReadOnly,
                  'spectrum-Textfield--multiline': multiLine
                }
              )
            }>
            <FocusRing focusRingClass={classNames(styles, 'focus-ring')} isTextInput autoFocus={autoFocus}>
              <ElementType
                {...mergeProps(inputProps, hoverProps)} 
                ref={inputRef as any}
                rows={multiLine ? 1 : undefined}
                value={readOnlyText}
                className={
                  classNames(
                    styles,
                    'spectrum-Textfield-input',
                    {
                    //   'spectrum-Textfield-inputIcon': icon,
                      'is-hovered': isHovered
                    }
                  )
                } />
            </FocusRing>
          </div>
          {description}
          {errorMessage}
        </Flex>
      );
    }

    return (
      <div
        {...styleProps}
        ref={ref as RefObject<HTMLDivElement>}
        className={labelWrapperClass}>
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
        {renderChildren()}
      </div>
    );
  }

  return React.cloneElement(children, mergeProps(children.props, {
    ...styleProps,
    // @ts-ignore
    ref: mergeRefs(children.ref, ref)
  }));
}

let _Field = React.forwardRef(Field);
export {_Field as Field};
