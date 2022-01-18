/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaLabelingProps, AsyncLoadable, Collection, CollectionBase, Direction, DOMProps, KeyboardDelegate, LoadingState, MultipleSelection, Node, Orientation, StyleProps} from '@react-types/shared';
import {Key, ReactNode} from 'react';
import {Layout} from '@react-stately/virtualizer';
import {Scale} from '@react-types/provider';

interface AriaCardProps extends AriaLabelingProps {}

interface SpectrumCardProps extends AriaCardProps, StyleProps, DOMProps {
  children: ReactNode,
  isQuiet?: boolean,
  layout?: 'grid' | 'waterfall' | 'gallery',
  // TODO: readd size when we get updated designs from spectrum
  // size?: 'S' | 'M' | 'L',
  orientation?: Orientation
}

export interface CardViewCardProps {
  /** Rendered contents of the card. Note that focusable elements are not allowed within the card in a CardView. */
  children: ReactNode,
  /** A string representation of the cards's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this card. */
  'aria-label'?: string,
  /** The raw height of the card's image. */
  height?: number,
  /** The raw width of the card's image. */
  width?: number,
  /** A unique key for the card. */
  key?: Key
}

interface LayoutOptions {
  // cardSize?: 'S' | 'M' | 'L',
  cardOrientation?: Orientation,
  collator?: Intl.Collator,
  // TODO: is this valid or is scale a spectrum specific thing that should be left out of the layouts?
  // Added here so we can keep the default item padding options within the layouts instead of having to
  // do extra work in CardView to accomodate different sizing for scales
  scale?: Scale
}

// TODO: double check if this is the best way to type the layout provided to the CardView
// Perhaps just have layout be typed as GridLayout || GalleryLayout || WaterfallLayout? Might make it easier
// especially since they each have different properties/options
interface CardViewLayout<T> extends Layout<Node<T>>, KeyboardDelegate {
  collection: Collection<Node<T>>,
  disabledKeys: any,
  isLoading: boolean,
  direction: Direction,
  layoutType: string,
  margin?: number
}

export interface CardViewLayoutConstructor<T> {
  new (options?: LayoutOptions): CardViewLayout<T>
}

interface CardViewProps<T> extends CollectionBase<T>, MultipleSelection, Omit<AsyncLoadable, 'isLoading'> {
  // TODO: Does LayoutContructor and Layout give enough info for a user to know what to put in their own custom layout?
  // Replaced with CardViewLayout so that they know they need to have keyboardDelegate stuff as well as collection, disabledKeys, etc
  /**
   * The layout that the CardView should use. Determines the visual layout of the cards and contains information such as the collecion of items,
   * loading state, keyboard delegate, etc. The available layouts include GridLayout, GalleryLayout, and WaterfallLayout. See the [Layout](#layout)
   * section for more information.
   */
  layout: CardViewLayoutConstructor<T> | CardViewLayout<T>,
  // TODO: readd size when we get updated designs from spectrum
  // cardSize?: 'S' | 'M' | 'L',
  /** The orientation of the cards within the CardView. */
  cardOrientation?: Orientation,
  /**
   * Whether the cards in the CardView should be displayed with a quiet style.
   * Note this option is only valid for the waterfall layout and doesn't affect the cards for the other layouts.
   */
  isQuiet?: boolean,
  /** Sets what the CardView should render when there is no content to display. */
  renderEmptyState?: () => JSX.Element,
  /** The current loading state of the CardView. */
  loadingState?: LoadingState
}

export interface AriaCardViewProps<T> extends CardViewProps<T>, DOMProps, AriaLabelingProps {}

export interface SpectrumCardViewProps<T> extends AriaCardViewProps<T>, StyleProps {}
