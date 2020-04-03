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

// @ts-ignore
import intlMessages from '../intl/*.json';
import React from 'react';
import {useMessageFormatter} from '@react-aria/i18n';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface DismissButtonProps {
  onDismiss?: () => void
}

export function DismissButton(props: DismissButtonProps) {
  let {onDismiss} = props;
  let formatMessage = useMessageFormatter(intlMessages);
  let onClick = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <VisuallyHidden>
      <button
        tabIndex={-1}
        aria-label={formatMessage('dismiss')}
        onClick={onClick} />
    </VisuallyHidden>
  );
}
