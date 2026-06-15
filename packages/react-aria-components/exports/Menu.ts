/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Mark as a client only package. This will cause a build time error if you try
// to import it from a React Server Component in a framework like Next.js.
import 'client-only';

export {
  Menu,
  MenuItem,
  MenuTrigger,
  MenuSection,
  MenuContext,
  MenuStateContext,
  RootMenuTriggerStateContext,
  SubmenuTrigger
} from '../src/Menu';
export {Collection, type CollectionProps} from 'react-aria/Collection';
export type {
  MenuProps,
  MenuItemProps,
  MenuItemRenderProps,
  MenuTriggerProps,
  SubmenuTriggerProps,
  MenuSectionProps
} from '../src/Menu';
export type {Key, Selection, SelectionMode} from '@react-types/shared';
export type {ListState} from 'react-stately/useListState';
export type {RootMenuTriggerState} from 'react-stately/useMenuTriggerState';

export {SelectionIndicator} from '../src/SelectionIndicator';
export type {SelectionIndicatorProps} from '../src/SelectionIndicator';

export {Text} from '../src/Text';
export type {TextProps} from '../src/Text';

export {Keyboard} from '../src/Keyboard';

export {Header} from '../src/Header';
export type {HeaderProps} from '../src/Header';

export {Popover} from '../src/Popover';
export type {PopoverProps, PopoverRenderProps} from '../src/Popover';

export {Separator} from '../src/Separator';
export type {SeparatorProps} from '../src/Separator';

export {Pressable} from 'react-aria/Pressable';
