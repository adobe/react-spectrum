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

import {HTMLAttributes, RefObject} from 'react';
import {AriaLinkProps} from '@react-types/link';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';

export interface AriaLinkOptions extends AriaLinkProps {
  /** Whether the link is disabled. */
  isDisabled?: boolean,
  /**
   * The HTML element used to render the link, e.g. "a", or "span".
   * @default "a"
   */
  elementType?: string,
  /** A ref to the link element. */
  ref?: RefObject<HTMLElement | null>
}

export interface LinkAria {
  /** Props for the link element. */
  linkProps: HTMLAttributes<HTMLDivElement>
}

/**
 * Provides the behavior and accessibility implementation for a link component.
 * A link allows a user to navigate to another page or resource within a web page
 * or application.
 */
export function useLink(props: AriaLinkOptions): LinkAria {
  let {
    tabIndex,
    elementType = 'a',
    onPress,
    onPressStart,
    onPressEnd,
    // @ts-ignore
    onClick: deprecatedOnClick,
    isDisabled,
    ref,
    ...otherProps
  } = props;

  let linkProps: HTMLAttributes<HTMLDivElement>;
  if (elementType !== 'a') {
    linkProps = {
      role: 'link',
      tabIndex: !isDisabled ? (tabIndex || 0) : undefined
    };
  }

  let {pressProps} = usePress({onPress, onPressStart, onPressEnd, isDisabled, ref});
  let domProps = filterDOMProps(otherProps, {labelable: true});

  return {
    linkProps: mergeProps(domProps, {
      tabIndex,
      ...pressProps,
      ...linkProps,
      'aria-disabled': isDisabled || undefined,
      onClick: (e) => {
        pressProps.onClick(e);
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    })
  };
}
