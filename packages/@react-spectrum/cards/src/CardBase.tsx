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
import {classNames, SlotProvider, useHasChild, useStyleProps} from '@react-spectrum/utils';
import {Divider} from '@react-spectrum/divider';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps, mergeProps} from '@react-aria/utils';
import {FocusRing} from '@react-aria/focus';
import React, {useMemo, useRef, useState} from 'react';
import {SpectrumCardProps} from '@react-types/cards';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';
import {useCard} from '@react-aria/cards';
import {useCardViewContext} from './CardViewContext';
import {useControlledState} from '@react-stately/utils';
import {useFocusWithin, useHover, usePress} from '@react-aria/interactions';
import {useProviderProps} from '@react-spectrum/provider';

// can there be a selection checkbox when not in a grid?
// is there a way to turn off the selection checkbox?
// is cards getting an isSelected prop? do cards have controlled/uncontrolled?


function CardBase(props: SpectrumCardProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let context = useCardViewContext() || {isSelected: true, onSelectionChange: () => {}, articleProps: {}}; // we can call again here, won't change from Card.tsx
  let {articleProps} = context;
  let [isSelected, setIsSelected] = useControlledState(context.isSelected, undefined, context.onSelectionChange);
  let {isQuiet, orientation = 'vertical'} = props;
  let {styleProps} = useStyleProps(props);
  let {cardProps, titleProps, contentProps} = useCard(props);
  // let domRef = useDOMRef(ref);
  let gridRef = useRef();

  let {hoverProps, isHovered} = useHover({});
  let [isFocused, setIsFocused] = useState(false);
  let {focusWithinProps} = useFocusWithin({
    onFocusWithinChange: setIsFocused
  });
  let {pressProps} = usePress({
    /* using press will result in a flash of no blue borders */
    onPressStart: () => setIsSelected(prev => !prev),
    isDisabled: orientation === 'horizontal'
  });

  let hasFooter = useHasChild(`.${styles['spectrum-Card-footer']}`, gridRef);

  let slots = useMemo(() => ({
    image: {UNSAFE_className: classNames(styles, 'spectrum-Card-image'), objectFit: isQuiet ? 'contain' : 'cover', alt: ''},
    illustration: {UNSAFE_className: classNames(styles, 'spectrum-Card-illustration')},
    avatar: {UNSAFE_className: classNames(styles, 'spectrum-Card-avatar'), size: 'avatar-size-100'},
    heading: {UNSAFE_className: classNames(styles, 'spectrum-Card-heading'), ...titleProps},
    content: {UNSAFE_className: classNames(styles, 'spectrum-Card-content'), ...contentProps},
    detail: {UNSAFE_className: classNames(styles, 'spectrum-Card-detail')},
    actionmenu: {UNSAFE_className: classNames(styles, 'spectrum-Card-actions'), align: 'end', isQuiet: true},
    footer: {UNSAFE_className: classNames(styles, 'spectrum-Card-footer')},
    divider: {UNSAFE_className: classNames(styles, 'spectrum-Card-divider'), size: 'S'}
  }), [titleProps, contentProps]);

  return (
    <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
      <article
        {...styleProps}
        {...mergeProps(cardProps, pressProps, focusWithinProps, hoverProps, filterDOMProps(props), articleProps)}
        ref={ref}
        className={classNames(styles, 'spectrum-Card', {
          'spectrum-Card--default': !isQuiet && orientation !== 'horizontal',
          'spectrum-Card--isQuiet': isQuiet && orientation !== 'horizontal',
          'spectrum-Card--horizontal': orientation === 'horizontal',
          'is-hovered': isHovered,
          'is-focused': isFocused,
          'is-selected': isSelected
        }, styleProps.className)}>
        <div ref={gridRef} className={classNames(styles, 'spectrum-Card-grid')}>
          <div className={classNames(styles, 'spectrum-Card-checkboxWrapper')}>
            <Checkbox
              excludeFromTabOrder
              isSelected={isSelected}
              onChange={setIsSelected}
              UNSAFE_className={classNames(styles, 'spectrum-Card-checkbox')}
              isEmphasized
              aria-label="select" />
          </div>
          <SlotProvider slots={slots}>
            {props.children}
            {hasFooter && <Divider />}
          </SlotProvider>
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
