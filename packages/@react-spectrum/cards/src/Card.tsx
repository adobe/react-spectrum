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

import {classNames, SlotProvider, useDOMRef, useHasChild, useStyleProps} from '@react-spectrum/utils';
import {Divider} from '@react-spectrum/divider';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria/utils';
import React, {useMemo, useRef} from 'react';
import {SpectrumCardProps} from '@react-types/cards';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';
import {useCard} from '@react-aria/cards';
import {useProviderProps} from '@react-spectrum/provider';


function Card(props: SpectrumCardProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {isQuiet, orientation = 'vertical'} = props;
  let {styleProps} = useStyleProps(props);
  let {cardProps, titleProps, contentProps} = useCard(props);
  let domRef = useDOMRef(ref);
  let gridRef = useRef();

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
    <article
      {...filterDOMProps(props)}
      {...cardProps}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Card', {
        'spectrum-Card--default': !isQuiet && orientation !== 'horizontal',
        'spectrum-Card--isQuiet': isQuiet && orientation !== 'horizontal',
        'spectrum-Card--horizontal': orientation === 'horizontal'
      }, styleProps.className)}>
      <div ref={gridRef} className={styles['spectrum-Card-grid']}>
        <SlotProvider slots={slots}>
          {props.children}
          {hasFooter && <Divider />}
        </SlotProvider>
      </div>
    </article>
  );
}

/**
 * TODO: Add description of component here.
 */
const _Card = React.forwardRef(Card);
export {_Card as Card};
