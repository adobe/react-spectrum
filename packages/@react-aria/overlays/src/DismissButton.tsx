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

import {AriaLabelingProps, DOMProps} from '@react-types/shared';
// @ts-ignore
import intlMessages from '../intl/*.json';
import React, {ReactNode} from 'react';
import {useLabels} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';
import {VisuallyHidden} from '@react-aria/visually-hidden';

export interface DismissButtonProps extends AriaLabelingProps, DOMProps {
  /** Called when the dismiss button is activated. */
  onDismiss?: () => void
}

/**
 * A visually hidden button that can be used to allow screen reader
 * users to dismiss a modal or popup when there is no visual
 * affordance to do so.
 */
export function DismissButton(props: DismissButtonProps): ReactNode {
  let {onDismiss, ...otherProps} = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-aria/overlays');

  let labels = useLabels(otherProps, stringFormatter.format('dismiss'));

  let onClick = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <VisuallyHidden>
      <button
        {...labels}
        tabIndex={-1}
        onClick={onClick}
        style={{width: 1, height: 1}} />
    </VisuallyHidden>
  );
}
