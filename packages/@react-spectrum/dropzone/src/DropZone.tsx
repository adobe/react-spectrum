/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, DOMProps, DOMRef, StyleProps} from '@react-types/shared';
import {classNames, SlotProvider, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DropZoneProps, DropZone as RACDropZone} from 'react-aria-components';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {mergeProps, useId} from '@react-aria/utils';
import React, {ReactNode} from 'react';
import styles from '@adobe/spectrum-css-temp/components/dropzone/vars.css';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface SpectrumDropZoneProps extends DropZoneProps, DOMProps, StyleProps, AriaLabelingProps {
  /** The content to display in the drop zone. */
  children: ReactNode,
  /** Whether the drop zone has been filled. */
  isFilled?: boolean,
  /** The message to replace the default banner message that is shown when the drop zone is filled. */
  replaceMessage?: string
}

function DropZone(props: SpectrumDropZoneProps, ref: DOMRef<HTMLDivElement>) {
  let {children, isFilled, replaceMessage, ...otherProps} = props;
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);
  let messageId = useId();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);

  return (
    <RACDropZone
      {...mergeProps(otherProps)}
      {...styleProps as Omit<React.HTMLAttributes<HTMLElement>, 'onDrop'>}
      aria-labelledby={isFilled ? messageId : null}
      className={
      classNames(
        styles,
        'spectrum-Dropzone',
        styleProps.className,
        {'spectrum-Dropzone--filled': isFilled}
      )}
      ref={domRef}>
      <SlotProvider
        slots={{
          illustration: {UNSAFE_className: classNames(
            styles,
            'spectrum-Dropzone-illustratedMessage'
            )}
        }}>
        {children}
      </SlotProvider>
      <div className={classNames(styles, 'spectrum-Dropzone-backdrop')} />
      <div
        id={messageId}
        className={
          classNames(
            styles,
            'spectrum-Dropzone-banner',
            styleProps.className
          )
        }>
        {replaceMessage ? replaceMessage : stringFormatter.format('replaceMessage')}
      </div>
    </RACDropZone>
  );
}

/**
 * A drop zone is an area into which one or multiple objects can be dragged and dropped.
 */
let _DropZone = React.forwardRef(DropZone);
export {_DropZone as DropZone};
