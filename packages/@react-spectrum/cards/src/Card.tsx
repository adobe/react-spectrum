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

import {classNames, SlotProvider, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps, useSlotId} from '@react-aria/utils';
import React, {useMemo, useRef} from 'react';
import {SpectrumCardProps} from '@react-types/cards';
import styles from '@adobe/spectrum-css-temp/components/card/vars.css';
import {useCard} from '@react-aria/cards';
import {useProviderProps} from '@react-spectrum/provider';
import {Divider} from '../../divider';
import {Grid} from '@react-spectrum/layout';


function Card(props: SpectrumCardProps, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {styleProps} = useStyleProps(props);
  let {cardProps, titleProps, detailProps} = useCard(props);
  let domRef = useDOMRef(ref);
  let gridRef = useRef();

  let slots = useMemo(() => ({
    image: {UNSAFE_className: classNames(styles, 'spectrum-Card-image')},
    illustration: {UNSAFE_className: classNames(styles, 'spectrum-Card-illustration')},
    avatar: {UNSAFE_className: classNames(styles, 'spectrum-Card-avatar'), size: 'avatar-size-100'},
    heading: {UNSAFE_className: classNames(styles, 'spectrum-Card-heading'), ...titleProps},
    content: {UNSAFE_className: classNames(styles, 'spectrum-Card-content')},
    detail: {UNSAFE_className: classNames(styles, 'spectrum-Card-detail'), ...detailProps},
    actionmenu: {UNSAFE_className: classNames(styles, 'spectrum-Card-actions'), align: 'end'},
    footer: {UNSAFE_className: classNames(styles, 'spectrum-Card-footer')},
    divider: {UNSAFE_className: classNames(styles, 'spectrum-Card-divider'), size: 'S'}
  }), [titleProps, detailProps]);

  return (
    <article
      {...filterDOMProps(props)}
      {...cardProps}
      {...styleProps}
      ref={domRef}
      className={classNames(styles, 'spectrum-Card', 'spectrum-Card-default', styleProps.className)}>
      <Grid ref={gridRef} UNSAFE_className={styles['spectrum-Card-grid']}>
        <SlotProvider slots={slots}>
          {props.children}
          <Divider />
        </SlotProvider>
      </Grid>
    </article>
  );
}

/**
 * TODO: Add description of component here.
 */
const _Card = React.forwardRef(Card);
export {_Card as Card};
