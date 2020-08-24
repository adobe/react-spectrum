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

import {BreadcrumbItemProps} from '@react-types/breadcrumbs';
import ChevronRightSmall from '@spectrum-icons/ui/ChevronRightSmall';
import {classNames, getWrappedElement} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import {mergeProps} from '@react-aria/utils';
import React, {Fragment, useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/breadcrumb/vars.css';
import {useBreadcrumbItem} from '@react-aria/breadcrumbs';
import {useHover} from '@react-aria/interactions';
import {useLocale} from '@react-aria/i18n';

export function BreadcrumbItem(props: BreadcrumbItemProps) {
  let {
    children,
    isCurrent,
    isDisabled
  } = props;

  let {direction} = useLocale();
  let ref = useRef();
  let {itemProps} = useBreadcrumbItem({
    ...props,
    elementType: typeof children === 'string' ? 'span' : 'a'
  }, ref);
  let {hoverProps, isHovered} = useHover(props);

  let element = React.cloneElement(
    getWrappedElement(children),
    {
      ...mergeProps(itemProps, hoverProps),
      ref,
      className:
        classNames(
          styles,
          'spectrum-Breadcrumbs-itemLink',
          {
            'is-disabled': !isCurrent && isDisabled,
            'is-hovered': isHovered
          }
        )
    }
  );

  return (
    <Fragment>
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        {element}
      </FocusRing>
      {isCurrent === false &&
        <ChevronRightSmall
          UNSAFE_className={
            classNames(
              styles,
              'spectrum-Breadcrumbs-itemSeparator',
              {
                'is-reversed': direction === 'rtl'
              }
            )
          } />
      }
    </Fragment>
  );
}
