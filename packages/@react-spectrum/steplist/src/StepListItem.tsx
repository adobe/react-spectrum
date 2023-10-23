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
import ChevronRightMedium from '@spectrum-icons/ui/ChevronRightMedium';
import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import intlMessages from '../intl';
import {mergeProps} from '@react-aria/utils';
import {Node} from '@react-types/shared';
import React, {Fragment, useContext, useRef} from 'react';
import {StepListContext} from './StepListContext';
import styles from '@adobe/spectrum-css-temp/components/steplist/vars.css';
import {useHover} from '@react-aria/interactions';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useStepListItem} from '@react-aria/steplist';
import {VisuallyHidden} from '@react-aria/visually-hidden';

interface SpectrumStepListItemProps<T> {
  item: Node<T>,
  isDisabled?: boolean,
  isEmphasized?: boolean,
  isReadOnly?: boolean
}

export function StepListItem<T>(props: SpectrumStepListItemProps<T>) {
  let {
    isDisabled,
    isEmphasized,
    item
  } = props;
  let {key} = item;
  const itemKey = item.key;

  let ref = useRef();
  let {direction} = useLocale();
  let state = useContext(StepListContext);
  const isCompleted = state.isCompleted(itemKey);
  const isItemDisabled = isDisabled || state.disabledKeys.has(itemKey);
  let {stepProps, stepStateProps} = useStepListItem({...props, key}, state, ref);

  let {hoverProps, isHovered} = useHover(props);
  const isSelected = state.selectedKey === itemKey;

  let stepStateText = '';
  const stringFormatter = useLocalizedStringFormatter(intlMessages);

  if (isSelected) {
    stepStateText = stringFormatter.format('current');
  } else if (isCompleted) {
    stepStateText = stringFormatter.format('completed');
  } else {
    stepStateText = stringFormatter.format('notCompleted');
  }

  return (
    <Fragment>
      <FocusRing within focusRingClass={classNames(styles, 'focus-ring')}>
        <a
          ref={ref}
          {...mergeProps(hoverProps, stepProps)}
          className={classNames(
            styles,
            'spectrum-Steplist-link',
            {
              'is-selected': isSelected && !isItemDisabled,
              'is-disabled': isItemDisabled,
              'is-hovered': isHovered,
              'is-emphasized': isEmphasized && isSelected,
              'is-completed': isCompleted
            }
          )}>
          <VisuallyHidden {...stepStateProps}>{stepStateText}</VisuallyHidden>
          <span className={classNames(styles, 'spectrum-Steplist-marker')}>{(item.index || 0) + 1}</span>
          <span className={classNames(styles, 'spectrum-Steplist-label')}>
            {item.rendered}
          </span>
        </a>
      </FocusRing>
      <span
        className={classNames(
          styles,
          'spectrum-Steplist-segment', {
            'is-completed': isCompleted
          })} >
        <ChevronRightMedium
          UNSAFE_className={classNames(styles, 'spectrum-Steplist-chevron', {
            'is-reversed': direction === 'rtl'
          })} />
      </span>
    </Fragment>
  );
}
