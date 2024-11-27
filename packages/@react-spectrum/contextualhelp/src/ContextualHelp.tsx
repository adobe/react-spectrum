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
import {classNames, ClearSlots, SlotProvider} from '@react-spectrum/utils';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {FocusableRef} from '@react-types/shared';
import HelpOutline from '@spectrum-icons/workflow/HelpOutline';
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
import InfoOutline from '@spectrum-icons/workflow/InfoOutline';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useLabels} from '@react-aria/utils';
import React from 'react';
import {SpectrumContextualHelpProps} from '@react-types/contextualhelp';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

/**
 * Contextual help shows a user extra information about the state of an adjacent component, or a total view.
 */
export const ContextualHelp = React.forwardRef(function ContextualHelp(props: SpectrumContextualHelpProps, ref: FocusableRef<HTMLButtonElement>) {
  let {
    variant = 'help',
    placement = 'bottom start',
    children,
    ...otherProps
  } = props;

  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/contextualhelp');

  let icon = variant === 'info' ? <InfoOutline /> : <HelpOutline />;

  let slots = {
    content: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-content']},
    footer: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-footer']}
  };

  let labelProps = useLabels(otherProps, stringFormatter.format(variant));

  return (
    <DialogTrigger {...otherProps} type="popover" placement={placement} hideArrow>
      <ActionButton
        {...mergeProps(otherProps, labelProps, {isDisabled: false})}
        ref={ref}
        UNSAFE_className={classNames(helpStyles, 'react-spectrum-ContextualHelp-button', otherProps.UNSAFE_className)}
        isQuiet>
        {icon}
      </ActionButton>
      <ClearSlots>
        <SlotProvider slots={slots}>
          <Dialog UNSAFE_className={classNames(helpStyles, 'react-spectrum-ContextualHelp-dialog')}>
            {children}
          </Dialog>
        </SlotProvider>
      </ClearSlots>
    </DialogTrigger>
  );
});
