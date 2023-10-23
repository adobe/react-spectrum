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

import {AriaLabelingProps, CollectionBase, DOMProps, Orientation, SingleSelection, StyleProps} from '@react-types/shared';
import {Key} from 'react';

interface StepListProps<T> extends CollectionBase<T>, SingleSelection {
  /** The key of the last completed step (controlled). */
  lastCompletedStep?: Key,
  /** The key of the initially last completed step (uncontrolled). */
  defaultLastCompletedStep?: Key,
  /** Callback for when the last completed step changes. */
  onLastCompletedStepChange?: (key: Key) => void,
  /** Whether the step list is disabled. Steps will not be focusable or interactive. */
  isDisabled?: boolean,
  /** Whether the step list is read only. Steps will be focusable but non-interactive. */
  isReadOnly?: boolean
}

interface AriaStepListProps<T> extends StepListProps<T>, AriaLabelingProps, DOMProps {}

interface SpectrumStepListProps<T> extends AriaStepListProps<T>, StyleProps {
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
