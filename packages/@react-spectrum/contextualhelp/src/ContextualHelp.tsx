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

import {ActionButton} from '@react-spectrum/button';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {FocusableRef} from '@react-types/shared';
import HelpOutline from '@spectrum-icons/workflow/HelpOutline';
import helpStyles from './contextualhelp.css';
import InfoOutline from '@spectrum-icons/workflow/InfoOutline';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React from 'react';
import {SlotProvider} from '@react-spectrum/utils';
import {SpectrumContextualHelpProps} from '@react-types/contextualhelp';
import {useMessageFormatter} from '@react-aria/i18n';

function ContextualHelp(props: SpectrumContextualHelpProps, ref: FocusableRef<HTMLButtonElement>) {
  let {
    variant = 'help',
    placement = 'bottom start',
    children,
    ...otherProps
  } = props;

  let formatMessage = useMessageFormatter(intlMessages);

  let icon = variant === 'info' ? <InfoOutline /> : <HelpOutline />;

  let slots = {
    content: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-content']},
    footer: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-footer']}
  };

  let ariaLabel = otherProps['aria-label'];
  if (!ariaLabel && !otherProps['aria-labelledby']) {
    ariaLabel = formatMessage(variant);
  }

  return (
    <DialogTrigger {...otherProps} type="popover" placement={placement} hideArrow>
      <ActionButton
        {...otherProps}
        ref={ref}
        UNSAFE_className={helpStyles['react-spectrum-ContextualHelp-button']}
        isQuiet
        aria-label={ariaLabel}>
        {icon}
      </ActionButton>
      <SlotProvider slots={slots}>
        <Dialog UNSAFE_className={helpStyles['react-spectrum-ContextualHelp-dialog']}>
          {children}
        </Dialog>
      </SlotProvider>
    </DialogTrigger>
  );
}

/**
 * Contextual help shows a user extra information about the state of an adjacent component, or a total view.
 */
let _ContextualHelp = React.forwardRef(ContextualHelp);
export {_ContextualHelp as ContextualHelp};
