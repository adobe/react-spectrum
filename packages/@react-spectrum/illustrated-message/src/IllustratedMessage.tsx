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

import {classNames, filterDOMProps, SlotProvider, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {Flex} from '@react-spectrum/layout';
import React, {forwardRef} from 'react';
import {SpectrumIllustratedMessageProps} from '@react-types/illustrated-message';
import styles from '@adobe/spectrum-css-temp/components/illustratedmessage/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

function IllustratedMessage(props: SpectrumIllustratedMessageProps, ref: DOMRef<HTMLDivElement>) {
  let {
    children,
    slots,
    ...otherProps
  } = props;

  let {styleProps} = useStyleProps(otherProps);
  let headingClassName = classNames(
    {},
    classNames(typographyStyles, 'spectrum-Heading', 'spectrum-Heading--pageTitle'),
    classNames(styles, 'spectrum-IllustratedMessage-heading')
  );
  let contentClassName = classNames(
    {},
    classNames(typographyStyles, 'spectrum-Body--secondary'),
    classNames(styles, 'spectrum-IllustratedMessage-description')
  );

  if (!slots) {
    slots = {
      heading: {UNSAFE_className: headingClassName},
      content: {UNSAFE_className: contentClassName}
    };
  }

  return (
    <Flex
      {...filterDOMProps(otherProps)}
      {...styleProps}
      UNSAFE_className={classNames(
        styles,
        'spectrum-IllustratedMessage',
        styleProps.className
      )}
      ref={ref}>
      <SlotProvider slots={slots}>
        {children}
      </SlotProvider>
    </Flex>
  );
}

let _IllustratedMessage = forwardRef(IllustratedMessage);
export {_IllustratedMessage as IllustratedMessage};
