/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, SpectrumFieldValidation, SpectrumHelpTextProps, StyleProps, Validation} from '@react-types/shared';
import React, {HTMLAttributes} from 'react';
// import styles from '@adobe/spectrum-css-temp/components/helptext/vars.css';
import {Text} from 'react-aria-components';
import {tv} from 'tailwind-variants';

const styles = tv({
  slots: {
    base: 'flex items-baseline',
    icon: 'center-baseline shrink-0'
  },
  variants: {
    size: {
      S: {
        base: 'text-75 gap-ttv-75'
      },
      M: {
        base: 'text-75 gap-ttv-75'
      },
      L: {
        base: 'text-100 gap-ttv-100'
      },
      XL: {
        base: 'text-200 gap-ttv-200'
      }
    },
    isInvalid: {
      false: {
        base: 'text-neutral-subdued'
      },
      true: {
        base: 'text-negative'
      }
    }
  },
  defaultVariants: {
    size: 'M'
  }
}, {twMerge: false});

interface HelpTextProps extends SpectrumHelpTextProps, Omit<Validation, 'validationState'>, SpectrumFieldValidation, StyleProps {
  /** Props for the help text description element. */
  descriptionProps?: HTMLAttributes<HTMLElement>,
  /** Props for the help text error message element. */
  errorMessageProps?: HTMLAttributes<HTMLElement>
}

function HelpText(props: HelpTextProps, ref: DOMRef<HTMLDivElement>) {
  let {
    description,
    errorMessage,
    validationState,
    isInvalid,
    isDisabled,
    showErrorIcon,
    descriptionProps,
    errorMessageProps,
    size = 'M'
  } = props;
  let domRef = useDOMRef(ref);
  isInvalid ||= validationState === 'invalid';
  let isErrorMessage = errorMessage && isInvalid;
  let {styleProps} = useStyleProps(props);

  let {base, icon} = styles({size, isInvalid});

  return (
    <Text
      {...styleProps}
      slot={isErrorMessage ? 'errorMessage' : 'description'}
      // className={classNames(
      //   styles,
      //   'spectrum-HelpText',
      //   `spectrum-HelpText--${isErrorMessage ? 'negative' : 'neutral'}`,
      //   {'is-disabled': isDisabled},
      //   styleProps.className
      // )}
      className={base()}
      ref={domRef}>
      {isErrorMessage ? (
        <>
          {showErrorIcon && <span className={icon()}><AlertMedium /*UNSAFE_className={classNames(styles, 'spectrum-HelpText-validationIcon')}*/ /></span>}
          {errorMessage}
        </>
      ) : description}
    </Text>
  );
}

/**
 * Help text provides either an informative description or an error message that gives more context about what a user needs to input. It's commonly used in forms.
 */
const _HelpText = React.forwardRef(HelpText);
export {_HelpText as HelpText};
