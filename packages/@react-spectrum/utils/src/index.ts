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

/// <reference types="css-module-types" />

export {
  shouldKeepSpectrumClassNames,
  keepSpectrumClassNames,
  classNames
} from '@adobe/react-spectrum/private/utils/classNames';

export {getWrappedElement} from '@adobe/react-spectrum/private/utils/getWrappedElement';
export {useMediaQuery} from '@adobe/react-spectrum/private/utils/useMediaQuery';
export {
  createDOMRef,
  createFocusableRef,
  useDOMRef,
  useFocusableRef,
  unwrapDOMRef,
  useUnwrapDOMRef
} from '@adobe/react-spectrum/private/utils/useDOMRef';
export {
  baseStyleProps,
  viewStyleProps,
  dimensionValue,
  responsiveDimensionValue,
  convertStyleProps,
  useStyleProps,
  passthroughStyle,
  getResponsiveProp
} from '@adobe/react-spectrum/private/utils/styleProps';
export {
  useSlotProps,
  cssModuleToSlots,
  SlotProvider,
  ClearSlots
} from '@adobe/react-spectrum/private/utils/Slots';
export {useHasChild} from '@adobe/react-spectrum/private/utils/useHasChild';
export {useIsMobileDevice} from '@adobe/react-spectrum/private/utils/useIsMobileDevice';
export {
  BreakpointProvider,
  useMatchedBreakpoints,
  useBreakpoint
} from '@adobe/react-spectrum/private/utils/BreakpointProvider';
export type {StyleHandlers} from '@adobe/react-spectrum/private/utils/styleProps';
export {useValueEffect} from 'react-aria/private/utils/useValueEffect';
export {useResizeObserver} from 'react-aria/private/utils/useResizeObserver';
