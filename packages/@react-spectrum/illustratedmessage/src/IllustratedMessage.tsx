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

import {classNames, ClearSlots, SlotProvider, useSlotProps, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {filterDOMProps} from '@react-aria-nutrient/utils';
import {Flex} from '@react-spectrum/layout';
import React, {forwardRef} from 'react';
import {SpectrumIllustratedMessageProps} from '@react-types/illustratedmessage';
import styles from '@adobe/spectrum-css-temp/components/illustratedmessage/vars.css';

/**
 * An IllustratedMessage displays an illustration and a message, usually
 * for an empty state or an error page.
 */
export const IllustratedMessage = forwardRef(function IllustratedMessage(props: SpectrumIllustratedMessageProps, ref: DOMRef<HTMLDivElement>) {
  props = useSlotProps(props, 'illustration');
  let {
    children,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let headingClassName = classNames(styles, 'spectrum-IllustratedMessage-heading');
  let contentClassName = classNames(styles, 'spectrum-IllustratedMessage-description');

  let slots = {
    heading: {UNSAFE_className: headingClassName},
    content: {UNSAFE_className: contentClassName}
  };

  return (
    <Flex
      {...filterDOMProps(otherProps)}
      UNSAFE_style={styleProps.style}
      isHidden={styleProps.hidden}
      UNSAFE_className={classNames(
        styles,
        'spectrum-IllustratedMessage',
        styleProps.className
      )}
      ref={ref}>
      <ClearSlots>
        <SlotProvider slots={slots}>
          {children}
        </SlotProvider>
      </ClearSlots>
    </Flex>
  );
});
