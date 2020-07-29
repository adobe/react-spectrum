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

import {CheckboxGroupState, useCheckboxGroupState} from '@react-stately/toggle';
import React, {useRef} from 'react';
import {render} from '@testing-library/react';
import {useCheckboxGroup, useGroupedCheckbox} from '../';

interface CheckboxProps {
  checkboxGroupState: CheckboxGroupState,
  index: number,
  value?: string,
  children?: string
}
interface CheckboxGroupsProps {
  checkboxProps?: CheckboxProps[],
  label?: string
}

const checkboxDefaults = [
  {value: 'foo', children: 'Foo'},
  {value: 'bar', children: 'Bar'},
  {value: 'xyz', children: 'Xyz'}
];

function Checkbox({checkboxGroupState, index, ...props}: CheckboxProps) {
  const finalProps = {
    ...checkboxDefaults[index],
    ...props
  };
  const ref = useRef<HTMLInputElement>();
  const {children} = finalProps;
  const {inputProps} = useGroupedCheckbox(finalProps, checkboxGroupState, ref);
  return <label>{children}<input ref={ref} {...inputProps} /></label>;
}

function CheckboxGroup({
  label = 'Legend',
  checkboxProps = [],
  ...props
}: CheckboxGroupsProps) {
  const state = useCheckboxGroupState();
  const {checkboxGroupProps, labelProps} = useCheckboxGroup({
    ...props,
    label
  });
  return (
    <div {...checkboxGroupProps}>
      <span {...labelProps}>{label}</span>
      <Checkbox checkboxGroupState={state} index={0} {...checkboxProps[0]} />
      <Checkbox checkboxGroupState={state} index={1} {...checkboxProps[1]} />
      <Checkbox checkboxGroupState={state} index={2} {...checkboxProps[2]} />
    </div>
  );
}

describe('useCheckboxGroup', () => {
  it('should return role="group"', () => {
    let {getByRole} = render(<CheckboxGroup />);
    expect(getByRole('group', {exact: true})).toBeTruthy();
  });
});
