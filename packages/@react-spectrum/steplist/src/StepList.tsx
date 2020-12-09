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

import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import {getChildrenSafe} from './utils';
import React, {Ref} from 'react';
import {SpectrumStepListProps} from '@react-types/steplist';
import {StepListItem} from './StepListItem';
import styles from '@adobe/spectrum-css-temp/components/steplist/vars.css';
import {useProviderProps} from '@react-spectrum/provider';
import {useStepList} from '@react-aria/steplist';
import {useStepListState} from '@react-stately/steplist';

function StepList<T extends object>(props: SpectrumStepListProps<T>, ref: DOMRef) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let state = useStepListState(props);
  let ariaProps = useStepList(); // useStepList(props, state);
  let domRef = useDOMRef(ref) as Ref<HTMLOListElement>;
  const {children, isEmphasized, isReadOnly} = props;
  // Not using React.Children.toArray because it mutates the key prop.
  const childArray = getChildrenSafe<T>(children);
  const stepListItems = childArray.map((child, index) => {
    let key = child.key ?? index;
    return (
      <StepListItem
        itemKey={key}
        isCurrent={key === state.selectedKey}
        isComplete={state.isCompleted(key)}
        isDisabled={false}
        isEmphasized={isEmphasized}
        isReadOnly={isReadOnly}
        isNavigable={state.isNavigable(key)}
        onItemSelected={state.setSelectedKey}>
        {child.props.children}
      </StepListItem>
    );
  });
  return (
    <ol
      {...ariaProps.listProps}
      {...filterDOMProps(props)}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Steplist', styleProps.className, {
        'spectrum-Steplist--interactive': !isReadOnly
      })}>
      {stepListItems}
    </ol>
  );
}

const _StepList = React.forwardRef(StepList);
export {_StepList as StepList};

export type {SpectrumStepListProps};
