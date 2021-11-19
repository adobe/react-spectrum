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
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Heading} from '@react-spectrum/text';
import HelpOutline from '@spectrum-icons/workflow/HelpOutline';
import helpStyles from './contextualhelp.css';
import InfoOutline from '@spectrum-icons/workflow/InfoOutline';
import React from 'react';
import {SpectrumContextualHelpProps} from '@react-types/contextualhelp';
import styles from '@adobe/spectrum-css-temp/components/icon/vars.css';

function ContextualHelp({variant = 'help', title, children, ...props}: SpectrumContextualHelpProps) {
  let icon = <HelpOutline />;
  if (variant === 'info') {
    icon = <InfoOutline />;
  }

  return (
    <DialogTrigger type="popover" placement="bottom end" hideArrow>
      <ActionButton isQuiet UNSAFE_className={styles['spectrum-Icon--sizeS']}>{icon}</ActionButton>
      <Dialog {...props} UNSAFE_className={helpStyles['react-spectrum-ContextualHelp-popover']}>
        <Heading>{title}</Heading>
        <Content marginTop="size-100">
          {children}
        </Content>
      </Dialog>
    </DialogTrigger>
  );
}

/**
 * Contextual help shows a user extra information about the state of an adjacent component, or a total view.
 */
export {ContextualHelp};
