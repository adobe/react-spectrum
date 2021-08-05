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

import {classNames, useDOMRef} from '@react-spectrum/utils';
import {DOMRef, SpectrumHelpTextProps} from '@react-types/shared';
import React, {HTMLAttributes} from 'react';
import styles from '@adobe/spectrum-css-temp/components/helptext/vars.css';

interface HelpTextProps extends SpectrumHelpTextProps {
  /** Props for the help text description element. */
  descriptionProps: HTMLAttributes<HTMLElement>,
  /** Props for the help text error message element. */
  errorMessageProps: HTMLAttributes<HTMLElement>
}

function HelpText(props: HelpTextProps, ref: DOMRef<HTMLDivElement>) {
  let {
    description,
    errorMessage,
    validationState,
    isDisabled,
    // TODO
    // showIcon,
    descriptionProps,
    errorMessageProps
  } = props;
  let domRef = useDOMRef(ref);

  if (!description && !(errorMessage && validationState === 'invalid')) {
    return null;
  }

  return (
    <div className={classNames(styles, 'spectrum-HelpText')} ref={domRef}>
      {errorMessage && validationState === 'invalid' ? (
        <div {...errorMessageProps} className={classNames(styles, 'spectrum-HelpText-errorMessage')}>
          {errorMessage}
        </div>
      ) : (
        <div
          {...descriptionProps}
          className={classNames(styles, 'spectrum-HelpText-description', {
            'is-disabled': isDisabled
          })}>
          {description}
        </div>
      )}
    </div>
  );
}

/**
 * TODO: Add description of component here.
 */
const _HelpText = React.forwardRef(HelpText);
export {_HelpText as HelpText};
