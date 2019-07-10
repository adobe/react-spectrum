/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import Button from '../src/Button';
import React from 'react';
import {storiesOf} from '@storybook/react';
import VisuallyHidden from '../src/VisuallyHidden';

storiesOf('VisuallyHidden', module)
  .add(
    'Default',
    () => (render({children: 'A visually hidden span of content'})),
    {info: 'A **VisuallyHidden** component provides text that is visually hidden yet remains accessible to assistive technology like screen readers.'}
  ).add(
    'element',
    () => render({element: 'div', children: 'A visually hidden div of content'})
  ).add(
    'focusable: true',
    () => render({focusable: true, element: 'a', href: '#main', className: 'spectrum-Link', target: '_self', children: 'Skip to Main Content'}),
    {info: 'The `focusable` boolean property is useful for implementations such as "skip links" where a visually hidden interactive control should become visible when it receives focus.'}
  ).add(
    'Link context (per WCAG 2.1 SC 2.4.4)',
    () => (<Button
      variant="cta"
      element="a"
      href="https://commerce.adobe.com/checkout?cli=adobe_com&co=US&lang=en&items[0][id]=632B3ADD940A7FBB7864AA5AD19B8D28&items[0][cs]=0"
      target="_blank">
      Buy&nbsp;<VisuallyHidden>Creative Cloud</VisuallyHidden> now
    </Button>),
    {info: 'Providing additional context when labelling a control may be necessary to satisfy [WCAG 2.1 Success Criterion 2.4.4 Link Purpose (In Context)](https://www.w3.org/TR/WCAG21/#link-purpose-in-context).'}
  );

function render(props = {}) {
  const {
    children,
    ...otherProps
  } = props;
  return (<div>
    <VisuallyHidden {...otherProps}>{children}</VisuallyHidden> 
  </div>);
}
