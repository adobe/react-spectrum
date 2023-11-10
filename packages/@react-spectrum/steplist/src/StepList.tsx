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

import {AriaStepListProps, useStepList} from '@react-aria/steplist';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, Orientation, StyleProps} from '@react-types/shared';
import React, {ReactElement} from 'react';
import {StepListContext} from './StepListContext';
import {StepListItem} from './StepListItem';
import styles from '@adobe/spectrum-css-temp/components/steplist/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useStepListState} from '@react-stately/steplist';

export interface SpectrumStepListProps<T> extends AriaStepListProps<T>, StyleProps {
  /**
   * Whether the step list should be displayed with a emphasized style.
   * @default false
   */
  isEmphasized?: boolean,
  /**
   * The orientation of the step list.
   * @default 'horizontal'
   */
  orientation?: Orientation,
  /**
   * The size of the step list.
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL'
}

function StepList<T extends object>(props: SpectrumStepListProps<T>, ref: DOMRef<HTMLOListElement>) {
  const {size = 'M', orientation = 'horizontal'} = props;
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let domRef = useDOMRef(ref);

  let state = useStepListState(props);
  let {listProps} = useStepList(props, state, domRef);

  const {isDisabled, isEmphasized, isReadOnly} = props;

  return (
    <ol
      {...listProps}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Steplist', styleProps.className, {
        'spectrum-Steplist--interactive': !isReadOnly && !isDisabled,
        'spectrum-Steplist--small': size === 'S',
        'spectrum-Steplist--medium': size === 'M',
        'spectrum-Steplist--large': size === 'L',
        'spectrum-Steplist--xlarge': size === 'XL',
        'spectrum-Steplist--vertical': orientation === 'vertical'
      })}>
      <StepListContext.Provider value={state}>
        {[...state.collection].map((item) => (
          <StepListItem
            key={item.key}
            isDisabled={isDisabled}
            isEmphasized={isEmphasized}
            isReadOnly={isReadOnly}
            item={item} />
          )
        )}
      </StepListContext.Provider>
    </ol>
  );
}

const _StepList = React.forwardRef(StepList) as <T>(props: SpectrumStepListProps<T> & {ref?: DOMRef<HTMLOListElement>}) => ReactElement;
export {_StepList as StepList};
