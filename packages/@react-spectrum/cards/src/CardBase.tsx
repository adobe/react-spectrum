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

import {Checkbox} from '@react-spectrum/checkbox';
import {classNames, SlotProvider, useDOMRef, useHasChild, useStyleProps} from '@react-spectrum/utils';
import {Divider} from '@react-spectrum/divider';
import {DOMRef, Node} from '@react-types/shared';
import {filterDOMProps, mergeProps, useLayoutEffect} from '@react-aria/utils';
import {FocusRing} from '@react-aria/focus';
import React, {HTMLAttributes, useMemo, useRef, useState} from 'react';
import {SpectrumCardProps} from '@react-types/cards';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';
import {useCard} from '@react-aria/cards';
import {useCardViewContext} from './CardViewContext';
import {useFocusWithin, useHover} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';

interface CardBaseProps<T> extends SpectrumCardProps {
  articleProps?: HTMLAttributes<HTMLElement>,
  item?: Node<T>
}

function CardBase<T extends object>(props: CardBaseProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  // TODO: Don't send in articleProps via context (unless we want to make another context for InternalCard)? Pass it in via props since it will only be provided via CardView's InternalCard
  let context = useCardViewContext() || {}; // we can call again here, won't change from Card.tsx
  let {state} = context;
  let manager = state?.selectionManager;
  // let [isSelected, setIsSelected] = useControlledState(context.isSelected, undefined, context.onSelectionChange);
  let {
    isQuiet,
    orientation = 'vertical',
    articleProps = {},
    item,
    layout
  } = props;

  let key = item?.key;
  let isSelected = manager?.isSelected(key);
  let isDisabled = state?.disabledKeys.has(key);
  let onChange = () => manager.select(key);

  let {styleProps} = useStyleProps(props);
  let {cardProps, titleProps, contentProps} = useCard(props);
  let domRef = useDOMRef(ref);
  let gridRef = useRef<HTMLDivElement>();

  let {hoverProps, isHovered} = useHover({});
  let [isFocused, setIsFocused] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setIsFocused,
    isDisabled
  });

  let hasFooter = useHasChild(`.${styles['spectrum-Card-footer']}`, gridRef);

  let slots = useMemo(() => ({
    image: {UNSAFE_className: classNames(styles, 'spectrum-Card-image'), objectFit: orientation === 'horizontal' ? 'cover' : 'contain', alt: ''},
    illustration: {UNSAFE_className: classNames(styles, 'spectrum-Card-illustration')},
    avatar: {UNSAFE_className: classNames(styles, 'spectrum-Card-avatar'), size: 'avatar-size-100'},
    heading: {UNSAFE_className: classNames(styles, 'spectrum-Card-heading'), ...titleProps},
    content: {UNSAFE_className: classNames(styles, 'spectrum-Card-content'), ...contentProps},
    detail: {UNSAFE_className: classNames(styles, 'spectrum-Card-detail')},
    actionmenu: {UNSAFE_className: classNames(styles, 'spectrum-Card-actions'), align: 'end', isQuiet: true},
    footer: {UNSAFE_className: classNames(styles, 'spectrum-Card-footer'), isHidden: isQuiet},
    divider: {UNSAFE_className: classNames(styles, 'spectrum-Card-divider'), size: 'S'}
  }), [titleProps, contentProps]);

  // this is for horizontal cards
  let [height, setHeight] = useState(NaN);
  useLayoutEffect(() => {
    if (orientation !== 'horizontal') {
      return;
    }
    let cardHeight = gridRef.current.getBoundingClientRect().height;
    setHeight(cardHeight);
  }, [gridRef, setHeight]);

  // this is for tile quiet, anything else?
  let [isCloseToSquare, setIsCloseToSquare] = useState(false);
  useLayoutEffect(() => {
    if (!(layout === 'grid' && isQuiet)) {
      return;
    }
    // ToDo: how to handle illustrations? what if the illustration looks like an image?
    let image = gridRef.current.querySelector(`.${styles['spectrum-Card-image']} img`) as HTMLImageElement;
    if (!image) {
      return;
    }
    let measure = () => {
      let height = image.naturalHeight;
      let width = image.naturalWidth;
      /*
      * ToDo: Choose between min-padding and plain ratio
      * Do we want to just do a ratio measurement when it's close to being a square?
      * or do we want to actually figure out min-padding?
      * Min Padding would require us to check that the padding is not less than the min in both Vertical and Horizontal
      * Unfortunately img contain doesn't actually create padding, which is what this math below can figure out
      * Vs the commented out straight ratio check
      * */
      let imgTagHeight = image.clientHeight;
      let imgTagWidth = image.clientWidth;
      let ratio = Math.min(imgTagWidth / width, imgTagHeight / height);
      let trueHeight = ratio * height;
      let trueWidth = ratio * width;
      let paddingVertical = imgTagHeight - trueHeight;
      let paddingHorizontal = imgTagWidth - trueWidth;
      if (paddingVertical < 16 && paddingHorizontal < 16) { // ToDo: does this need to be different per scale?
        setIsCloseToSquare(true);
      } else {
        setIsCloseToSquare(false);
      }

      // let ratio = height / width;
      // if (ratio > 0.9 && ratio < 1.1) {
      //   setIsCloseToSquare(true);
      // }
    };
    if (image.complete) {
      measure();
    } else {
      image.addEventListener('load', measure);
      return () => {
        image.removeEventListener('load', measure);
      };
    }
    // ToDo: how to re-run if image src changes?
  }, [props.children, setIsCloseToSquare]);


  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <article
        {...styleProps}
        {...mergeProps(cardProps, focusWithinProps, hoverProps, filterDOMProps(props), articleProps)}
        ref={domRef}
        className={classNames(styles, 'spectrum-Card', {
          'spectrum-Card--default': !isQuiet && orientation !== 'horizontal',
          'spectrum-Card--isQuiet': isQuiet && orientation !== 'horizontal',
          'spectrum-Card--horizontal': orientation === 'horizontal',
          'spectrum-Card--closeToSquare': isCloseToSquare,
          'is-hovered': isHovered,
          'is-focused': isFocused,
          'is-selected': isSelected,
          'spectrum-Card--waterfall': layout === 'waterfall',
          'spectrum-Card--gallery': layout === 'gallery',
          'spectrum-Card--grid': layout === 'grid',
          'spectrum-Card--noLayout': layout !== 'waterfall' && layout !== 'gallery' && layout !== 'grid'
        }, styleProps.className)}>
        <div ref={gridRef} className={classNames(styles, 'spectrum-Card-grid')}>
          {manager && manager.selectionMode !== 'none' && (
            <div className={classNames(styles, 'spectrum-Card-checkboxWrapper')}>
              <Checkbox
                excludeFromTabOrder
                isSelected={isSelected}
                onChange={onChange}
                UNSAFE_className={classNames(styles, 'spectrum-Card-checkbox')}
                isEmphasized
                aria-label="select" />
            </div>
          )}
          {/* This is to workaround the FF bug mentioned in the CSS, it maintains a 1:1 aspect-ratio grid area */
            orientation === 'horizontal' && !isNaN(height) && (
            <img className={classNames(styles, 'spectrum-Card-sizeHelper')} style={{width: `${height}px`, height: `${height}px`}} aria-hidden alt="" width="1" height="1" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" />
          )}
          <SlotProvider slots={slots}>
            {props.children}
            {hasFooter && <Divider />}
          </SlotProvider>
          <div className={classNames(styles, 'spectrum-Card-decoration')} />
        </div>
      </article>
    </FocusRing>
  );
}

/**
 * TODO: Add description of component here.
 */
const _CardBase = React.forwardRef(CardBase);
export {_CardBase as CardBase};
