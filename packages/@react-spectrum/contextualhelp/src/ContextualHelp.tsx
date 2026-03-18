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
import {AriaLabelingProps, DOMProps, FocusableRef, StyleProps} from '@react-types/shared';
import {classNames, ClearSlots, SlotProvider} from '@react-spectrum/utils';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import HelpOutline from '@spectrum-icons/workflow/HelpOutline';
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
import InfoOutline from '@spectrum-icons/workflow/InfoOutline';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useLabels} from '@react-aria/utils';
import {OverlayTriggerProps} from '@react-stately/overlays';
import {Placement, PositionProps} from '@react-aria/overlays';
import React, {ReactNode} from 'react';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface SpectrumContextualHelpProps extends OverlayTriggerProps, PositionProps, StyleProps, DOMProps, AriaLabelingProps {
  /** Contents of the Contextual Help popover. */
  children: ReactNode,
  /**
   * Indicates whether contents are informative or provides helpful guidance.
   * @default 'help'
   */
  variant?: 'help' | 'info',
  /**
   * The placement of the popover with respect to the action button.
   * @default 'bottom start'
   */
  placement?: Placement
}

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
