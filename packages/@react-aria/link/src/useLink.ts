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

import {AllHTMLAttributes, RefObject, SyntheticEvent} from 'react';
import {DOMProps, PressEvent} from '@react-types/shared';
import {LinkProps} from '@react-types/link';
import {useId} from '@react-aria/utils';
import {usePress} from '@react-aria/interactions';

export interface AriaLinkProps extends LinkProps, DOMProps {
  isDisabled?: boolean,
  href?: string,
  tabIndex?: number,
  onPress?: (e: PressEvent) => void,
  onClick?: (e: SyntheticEvent) => void,
  ref: RefObject<HTMLElement | null>
}

export interface LinkAria {
  linkProps: AllHTMLAttributes<HTMLDivElement>
}

export function useLink(props: AriaLinkProps): LinkAria {
  let {
    id,
    href,
    tabIndex = 0,
    children,
    onPress,
    onPressStart,
    onPressEnd,
    onClick: deprecatedOnClick,
    isDisabled,
    ref
  } = props;

  let linkProps: AllHTMLAttributes<HTMLDivElement>;
  if (typeof children === 'string') {
    linkProps = {
      role: 'link',
      tabIndex: !isDisabled ? tabIndex : undefined,
      'aria-disabled': isDisabled || undefined
    };
  }

  if (href) {
    console.warn('href is deprecated, please use an anchor element as children');
  }

  let {pressProps} = usePress({onPress, onPressStart, onPressEnd, isDisabled, ref});

  return {
    linkProps: {
      ...pressProps,
      ...linkProps,
      id: useId(id),
      onClick: (e) => {
        pressProps.onClick(e);
        if (deprecatedOnClick) {
          deprecatedOnClick(e);
          console.warn('onClick is deprecated, please use onPress');
        }
      }
    }
  };
}
